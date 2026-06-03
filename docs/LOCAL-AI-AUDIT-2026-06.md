# Local AI — Phase-0-Audit (CulinaSync-de-)

**Stand:** 2026-06-03  
**Scope:** Ist-Analyse vs. Referenz-Repos (CannaGuide-2025, StoryCraft-Studio), i18n-Gates, Test-Coverage, Gap-Liste für Phase 1+

---

## 1. Executive Summary

| Dimension | CulinaSync (Ist) | CannaGuide / StoryCraft (Referenz) | Delta |
|-----------|------------------|-------------------------------------|-------|
| **4-Layer Local Stack** | Nur Skelett (`createLocalAiFacade`, GPU-Check) | Voll verdrahtet (WebLLM → ONNX → Transformers → Heuristic) | **Groß** |
| **Routing** | Cloud-first (`aiService` → Gemini, Fehler → Heuristik) | Local-first (`aiProviderService`, explizite Provider) | **Groß** |
| **RAG** | Kein domänenspezifisches RAG | Grow-Log / Manuscript-RAG + Embedding-Cache | **Groß** |
| **Vision (Pantry)** | Nur Gemini (`extractPantryItemsFromImage`) | ONNX/CLIP-Pfade in Referenz geplant/teilweise | **Mittel** |
| **Worker-Infrastruktur** | `WorkerBus` in `ai-core`; `nutritionWorker` (heuristisch) | Dedizierte LLM/Vision-Worker + Bus | **Mittel** |
| **Voice** | Browser-STT + optional Whisper (STT only) | StoryCraft: lokale Antwort-Pipeline teilweise | **Mittel** |
| **Security / i18n** | Stark (Zod, `sanitizeForPrompt`, i18n-Gates grün) | Vergleichbar | **Klein (Vorteil CulinaSync)** |
| **Domänen-Integration** | Dexie, Repositories, `serviceRegistry`, AI-Chef-Feature | Generischer KI-Stack | **Chance: CulinaSync tiefer** |

**Fazit:** CulinaSync hat ein solides **Cloud-BYOK-Fundament** und einen **i18n-sicheren Heuristik-Fallback**, aber **keine echte lokale Inferenz**. Die Referenz-Repos liefern den Blueprint; Phase 1 muss `packages/ai-core` und `aiProviderService` aufbauen und das PRD von „Gemini optional“ auf „Local default, Cloud optional“ erweitern.

---

## 2. CulinaSync — KI-Iststand (Datei für Datei)

### 2.1 `packages/ai-core` (~4 Module, keine echten Modelle)

| Modul | Funktion | Reife |
|-------|----------|-------|
| `sanitizeForPrompt.ts` | Prompt-Härtung | ✅ produktiv (von `geminiService` genutzt) |
| `workerBus.ts` | 4-Prioritäts-Job-Queue | ✅ implementiert, **nicht** von App-Features genutzt |
| `localAiFacade.ts` | WebGPU-Adapter-Check → `preferredLayer` | ⚠️ nur Metadaten |
| `optionalMlImports.ts` | Dynamischer Import WebLLM / Transformers | ⚠️ nie aufgerufen |
| `package.json` | Optional deps: `@mlc-ai/web-llm`, `@xenova/transformers`, `onnxruntime-web` | installiert, **nicht verdrahtet** |

**Export-Oberfläche:** `sanitizeForPrompt`, `WorkerBus`, `createLocalAiFacade`, `tryImportWebLlm`, `tryImportTransformers` — kein `modelRegistry`, kein `providers`, kein `/ml`-Subpath.

### 2.2 App-Schicht (`apps/web/src/services/`)

| Datei | Zeilen (ca.) | Rolle |
|-------|--------------|-------|
| `geminiService.ts` | ~605 | **Einzige** Cloud-Fassade: Ideen, Rezept, Einkaufsliste, Bild, Web-Import, Nährwert-Verify, Pantry-Vision |
| `aiService.ts` | ~62 | Wrapper: **immer zuerst Gemini**; bei Netzwerk/Key-Fehler → `aiOfflineFallback` |
| `aiOfflineFallback.ts` | ~183 | Layer-4-Heuristik (Templates, Pantry-Sortierung, i18n) — **kein LLM** |
| `geminiSchemas.ts` | — | Zod/JSON-Schemas für strukturierte Antworten |
| `serviceRegistry.ts` | — | `AiGateway`: Ideen/Rezept/Liste via `aiService`; Bild/Vision **direkt** `geminiService` |

**Cloud-APIs (exportiert aus `geminiService`):**

- `generateRecipeIdeas`, `generateRecipe`, `generateShoppingList`
- `generateRecipeImage`, `extractRecipeFromWebContent`
- `verifyNutritionAndAllergensWithGemini`, `extractPantryItemsFromImage`

### 2.3 Feature-Integration

| Bereich | Pfad | KI-Nutzung |
|---------|------|------------|
| AI-Chef | `features/ai-chef/` | `generateChefIdeas` / `generateChefRecipe` → `serviceRegistry.ai` → `aiService` |
| Shopping AI-Modal | `components/shopping-list/AiModal.tsx` | `generateShoppingList` via `aiService` |
| Rezept-Detail | `useRecipeDetail.ts` | Nährwert-Verify lazy → `geminiService` |
| Rezept-Import | `recipeImportService.ts` | Web-Extraktion → `geminiService` |
| RTK Query | `store/aiCloudApi.ts` | Cloud-Ideen-Mutation → `geminiService` |
| Cook-Mode | `components/cook-mode/` | **Kein** KI-Assistent |
| Pantry | PantryManager | Vision nur über Gemini (kein ONNX) |
| Voice | `voiceCommands.ts`, `VoicePanel` | Regelbasierte Intents; Whisper = STT only |

### 2.4 Lokale Nicht-LLM-Pfade (bereits vorhanden)

- `nutritionWorker.ts` + `nutritionAllergyService.ts` — deterministische Nährwert-/Allergen-Analyse (food DB)
- `scannerService` — Barcode/OCR (Quagga/Tesseract), dynamisch geladen
- `whisperService` — optionales STT (Modell-Download in Settings)

### 2.5 Build / Bundle

- `vite.config.ts`: Chunk `vendor-ai` = `@google/genai` + `@domain/ai-core`
- WebLLM/ONNX/Transformers **nicht** in Manual Chunks — für Phase 1: eigene Lazy-Chunks (`vendor-webllm`, `vendor-onnx`, …) + SW `globIgnores`

### 2.6 PRD-Abweichung (bewusst zu klären in Phase 1)

Aktuell (`PRD.md` §5.5): *„KI (Google Gemini) ist eine **optionale** Erweiterung“* — erfüllt für **Kernflows ohne Key**, aber **nicht** für „maximal lokal“. Geplante Erweiterung:

- **FR-A05:** Local AI ist Default; vollständig offline ohne Cloud-Key für definierte KI-Features (mit Heuristik als garantiertem Layer 4).
- **FR-A06:** Cloud (Gemini BYOK) nur bei explizitem Opt-in / fehlendem Local-Modell.

---

## 3. Referenz-Repos — relevante Strukturen (Juni 2026)

> Analyse per öffentlicher Repo-Struktur / qnbs Local-AI-Philosophie. Details können sich leicht unterscheiden — vor Phase-1-Implementierung jeweils `main` erneut diffen.

### 3.1 CannaGuide-2025

| Pattern | Typische Pfade |
|---------|----------------|
| Local-AI-Kern | `apps/web/services/local-ai/core/localAI.ts` |
| Provider-Routing | `aiProviderService.ts` |
| RAG | `growLogRagService`, `knowledgeRagService`, `ragEmbeddingCacheService` |
| Monorepo | `packages/ai-core` mit `modelRegistry.ts`, `providers.ts`, `/ml`-Export |

### 3.2 StoryCraft-Studio

| Pattern | Typische Pfade |
|---------|----------------|
| Facade | `services/localAiFacade.ts`, `services/aiProviderService.ts` |
| Engines | `packages/ai-core`: `webllmOptimizer.ts`, `onnxRuntimeEngine.ts`, `webnnBridge.ts`, `tabLeaderElection.ts` |

### 3.3 Gemeinsamer Gold-Standard (4 Layer)

1. **WebLLM** (WebGPU) — generative Tasks  
2. **ONNX Runtime Web** — Vision, strukturierte Inferenz  
3. **Transformers.js** — Embeddings, leichte NLP  
4. **Heuristic** — deterministisch, immer verfügbar (`aiOfflineFallback` bei CulinaSync bereits gut)

---

## 4. i18n-Audit (Phase 0 — vollständig)

| Gate | Befehl | Ergebnis (2026-06-03) |
|------|--------|------------------------|
| Hardcoded Scan | `pnpm run i18n:scan` | **0** Funde (176 Produktionsdateien) |
| Locale-Parität | `pnpm run i18n:check` | **OK** (de/en: core, settings, features) |
| Baseline | `pnpm run i18n:check` | **0** erlaubte Production-Findings |

**Verbleibende user-facing i18n-Probleme:** **keine** laut CI-Gates.

**Hinweis:** Ältere Audit-Angaben (~59–61 % Coverage) sind **veraltet**. Aktuell (Vitest v8, `apps/web`):

| Metrik | Wert |
|--------|------|
| Statements | **77,85 %** |
| Branches | **62,71 %** |
| Functions | **73,06 %** |
| Lines | **79,10 %** |

**KI-spezifische Locale-Bereiche (bereits vorhanden):** `gemini.*`, `aiOffline.*`, Settings `apiKey` / `aiPreferences`, `settings.speech.*`.

**Phase-1-Pflicht:** Alle neuen KI-UI-Strings in `apps/web/src/locales/{de,en}/{core,settings,features}.json` — Keys vor Merge in beiden Sprachen.

---

## 5. Gap-Matrix (priorisiert für Implementierung)

| ID | Gap | Priorität | Phase |
|----|-----|-----------|-------|
| G1 | `aiProviderService` (Local-first Routing) | P0 | 1 |
| G2 | WebLLM-Engine + Model-Registry + Download-UI | P0 | 1 |
| G3 | Domänen-RAG (Rezepte, Pantry, MealPlan) in Dexie | P0 | 1 |
| G4 | `aiService` Refactor: Local → Cloud → Heuristic | P0 | 1 |
| G5 | Rezept-Generator lokal + RAG | P0 | 1 |
| G6 | Cook-Mode KI-Assistent | P0 | 2 |
| G7 | Pantry-Vision (ONNX/CLIP) ohne Cloud-Pflicht | P1 | 2 |
| G8 | Smart Meal Planner (RAG + Ablauf) | P1 | 2 |
| G9 | Smart Shopping (LLM + Heuristik) | P1 | 2 |
| G10 | Inference-Cache (IndexedDB, TTL) | P1 | 3 |
| G11 | Globaler KI-Koch-Chat (RAG) | P1 | 2–3 |
| G12 | Voice: lokale Intent-Antworten | P2 | 2–3 |
| G13 | Ollama-Connector (Desktop) | P2 | 4 |
| G14 | Tauri-native Beschleunigung (Whisper/Modelle) | P2 | 4 |
| G15 | PRD + `instructions.md` Local-AI-Default | P0 | 1 (Doku) |
| G16 | CSP `wasm-unsafe-eval` nur für WebLLM-Pfad dokumentieren/segmentieren | P1 | 1–3 |
| G17 | Tests für alle Local-AI-Pfade in `ai-core` + App | P0 | 1–3 |

---

## 6. Risiken & Constraints (CulinaSync-spezifisch)

1. **Architektur-Regeln bleiben:** Dexie nur über Repositories; Gemini-Client nur in `geminiService.ts` (wird **Backend** der Cloud-Schicht, nicht duplizieren).
2. **Bundle-Budget:** WebLLM-Modelle sind MB–GB — nur Lazy-Load + Settings-Download, nicht SW-Precache.
3. **Low-End-Geräte:** GPU-Tier → kleineres Modell oder direkt Layer 3/4.
4. **Kein API-Key im Build:** unverändert; Local AI darf keine Cloud-Credentials voraussetzen.
5. **Zod-Pflicht:** Alle generativen JSON-Antworten (lokal wie cloud) durch bestehende Schemas in `geminiSchemas.ts` / Shared-Schemas in `ai-core`.

---

## 7. Empfohlene nächste Schritte (Phase 1 Kickoff)

1. `docs/LOCAL-AI-ARCHITECTURE.md` als Implementierungsvertrag lesen/umsetzen.  
2. Branch `cursor/local-ai-phase1-bd1d` von `main` (nach Merge offener Roadmap-PRs).  
3. `packages/ai-core` erweitern: `modelRegistry`, `providers`, `localAiWebLlmEngine`, `localAiHeuristicEngine`.  
4. `apps/web/src/services/aiProviderService.ts` + Settings-Panel „Lokale KI“.  
5. Ersten End-to-End-Pfad: **Rezept-Ideen** lokal (WebLLM oder Heuristic) mit RAG-Kontext aus Pantry.  
6. `pnpm run check:all` grün halten; PRD FR-A05/A06 vorschlagen.

---

## 8. Verwandte Dokumente

- [LOCAL-AI-ARCHITECTURE.md](./LOCAL-AI-ARCHITECTURE.md) — Zielarchitektur & Phasenplan  
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Gesamt-Layer-Diagramm  
- [PRD.md](../PRD.md) — Feature-Anforderungen (§5.5 KI)  
- `.github/copilot-instructions.md` — Gemini/Dexie-Grenzen  
