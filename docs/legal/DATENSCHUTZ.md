# Datenschutzerklärung (CulinaSync)

> Stand: 2026-07-15 · Gilt für die Local-First-PWA und optionale Desktop-Builds (Tauri).

## Kurzfassung

CulinaSync speichert **Haushalts- und Rezeptdaten lokal** auf Ihrem Gerät (IndexedDB / Dexie). Es gibt **keinen** zentralen CulinaSync-Account-Server. Cloud-Funktionen (Gemini, WebDAV/Nextcloud, optionale CDNs für On-Device-Modelle) werden nur genutzt, wenn Sie sie aktivieren bzw. Daten bewusst dorthin senden.

## 1. Verantwortlichkeit

Verantwortlich für die Verarbeitung im Sinne der DSGVO ist der Betreiber der von Ihnen genutzten Installation (Self-Host / GitHub Pages / eigene Domain) bzw. Sie selbst bei lokaler Nutzung. Dieses Dokument beschreibt die **technische Datenverarbeitung der App**.

## 2. Welche Daten verarbeitet die App?

| Kategorie | Beispiele | Speicherort |
|-----------|-----------|-------------|
| Domänendaten | Vorrat, Rezepte, Essensplan, Einkaufsliste | IndexedDB (Browser / Desktop) |
| Einstellungen | Sprache, UI, Local-AI-Toggles | Redux Persist / localStorage |
| API-Schlüssel (Gemini) | BYOK-Key | Verschlüsselt/obfuskiert in IndexedDB (`apiKeyService`) |
| Sync-Geheimnisse | Nextcloud-App-Passwort, Backup-Passphrase | Verschlüsselt lokal; Metadaten teils sessionStorage |
| Logs (optional) | Fehlertexte für Diagnose | Lokal (`errorLoggingService`) |

**Keine** Tracking-Tracker von Drittanbietern sind in der Kern-App vorgesehen. Analytics-/Telemetrie-Toggles in den Einstellungen steuern nur lokale bzw. explizit dokumentierte Optionen.

## 3. KI / Gemini (BYOK)

- Der Gemini-API-Key wird **nicht** im Build eingebettet.
- Sie hinterlegen den Key selbst; er verlässt Ihr Gerät nur in Richtung Google Gemini, wenn Sie KI-Funktionen auslösen.
- Prompt-Inhalte (Wünsche, Vorratsnamen, ggf. Web-Import-Text) werden an Gemini gesendet — nutzen Sie die App entsprechend bewusst.
- On-Device-Pfade (WebLLM, Whisper, Embeddings) verarbeiten Daten lokal; Modell-Downloads können von öffentlichen CDNs erfolgen.

## 4. Sync & Backup

- **QR-/Gerät-Sync:** Datenübertragung peer-to-peer über von Ihnen geteilte Payloads.
- **WebDAV / Nextcloud:** Verschlüsselte Backups auf Ihrem Server; Passwörter/App-Passwörter bleiben unter Ihrer Kontrolle.
- **Vault:** Passwortgeschützte Archive — ohne Passwort keine Entschlüsselung.

## 5. Desktop (Tauri)

Desktop-Builds nutzen dieselbe Local-First-Logik. Zusätzliche OS-Berechtigungen (Mikrofon für Whisper, Dateizugriff) gelten nach Plattformrichtlinien.

## 6. Ihre Rechte

Sie können Daten jederzeit lokal exportieren, löschen (Reset) oder Backups entfernen. Bei rein lokaler Nutzung haben Sie die faktische Kontrolle über alle Domänendaten auf dem Gerät.

## 7. Änderungen

Aktualisierungen dieser Erklärung erfolgen im Repository (`docs/legal/DATENSCHUTZ.md`) und werden bei substanziellen Änderungen im CHANGELOG erwähnt.

## 8. Kontakt

Sicherheitsmeldungen: siehe [`SECURITY.md`](../../SECURITY.md).
