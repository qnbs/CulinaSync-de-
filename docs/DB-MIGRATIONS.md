# Dexie-Schema & Migrationen

> **Stand:** 2026-06-03 · Quelle: `apps/web/src/services/dbMigrations.ts`

CulinaSync nutzt **Dexie** mit versionierten Stores und expliziten Upgrade-Hooks. Migrationen sind **kein** separates SQL-Projekt — sie leben im App-Code und werden beim DB-Open angewendet.

---

## Einstieg im Code

| Datei | Rolle |
|-------|--------|
| `apps/web/src/services/dbMigrations.ts` | `DB_MIGRATION_HISTORY` — Versionen, Store-Schemas, `upgrade`-Hooks |
| `apps/web/src/services/db.ts` | DB-Init, `populate`, Anbindung an Dexie |
| `apps/web/src/services/__tests__/dbMigrations.test.ts` | Regressionstests für Backup-Gate & Upgrade-Pfade |

---

## Versionshistorie (Auszug)

| Version | Beschreibung |
|---------|----------------|
| **8** | `updatedAt` für Vorrat und Rezepte |
| **9** | `pantryMatchPercentage` / `ingredientCount` an Rezepten |
| **10** | Normalisierung `imageUrl` |
| **11** | Tabelle `appLogs` |
| **12** | Zusammengesetzte Indizes Vorrat (`category+expiryDate`) |
| **13** | Tabelle `aiEmbeddings` (semantisches Local-AI-RAG) |

Vollständige Liste und Store-Definitionen: `DB_MIGRATION_HISTORY` in `dbMigrations.ts`.

---

## Backup-Gate vor Upgrade

Vor riskanten Upgrades kann ein **IndexedDB-Backup** der betroffenen Stores erzeugt werden (siehe Tests in `dbMigrations.test.ts`). Das schützt Nutzerdaten bei Schema-Änderungen auf bestehenden Geräten.

**Nutzer-sichtbar:** Einstellungen → Daten → Export/Import; Cloud-Sync (`syncService`) nutzt verschlüsselte Backups (CSB2-Format).

---

## Neue Migration hinzufügen (Checkliste)

1. Neue **Version** in `DB_MIGRATION_HISTORY` (nur aufwärts, nie Versionen überspringen).
2. `stores`-Map für alle Tabellen — Dexie erwartet vollständige Store-Liste pro Version.
3. Optional `upgrade(tx)` für Daten-Backfill (idempotent schreiben).
4. Test in `dbMigrations.test.ts` oder Repository-Integrationstest.
5. `CHANGELOG.md` [Unreleased] + ggf. Hilfe-FAQ bei nutzer-sichtbarem Verhalten.

---

## Häufige Missverständnisse

| Mythos | Realität |
|--------|----------|
| „Es gibt keine Dexie-Migrationen“ | `dbMigrations.ts` seit mehreren Releases aktiv |
| „Redux persistiert Rezepte“ | Nur `settings`-Slice; Domain in IndexedDB |
| „Sync ersetzt Migration“ | Sync merged/importiert Daten; Schema kommt lokal aus Dexie |

---

## Verwandte Doku

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Datenfluss Dexie ↔ Repositories
- [DEPLOYMENT.md](./DEPLOYMENT.md) — CI; keine DB-Migration auf dem Server (Local-First)
- [AUDIT-vNEXT-2026-06-03.md](./AUDIT-vNEXT-2026-06-03.md) — Finding „Migration fehlt“ korrigiert (R-007)
