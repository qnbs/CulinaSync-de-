# Local AI — Phase-0-Audit (CulinaSync-de-)

**Stand:** 2026-06-03 (aktualisiert nach M11.4)  
**Scope:** Ist-Analyse vs. Referenz-Repos; Gap-Liste für verbleibende Phasen

---

## 1. Executive Summary

| Dimension | CulinaSync (Ist, Juni 2026) | Referenz-Repos | Delta |
|-----------|------------------------------|----------------|-------|
| **4-Layer Local Stack** | L1 WebLLM (opt-in), L3 Embeddings live, L4 Heuristik; L2 ONNX fehlt | Voll verdrahtet | **Mittel** |
| **Routing** | **`local-first`** via `aiProviderService` | Local-first | **Klein** |
| **RAG** | Hybrid keyword + semantic; Rezepte, Vorrat, **Meal-Plan** | Domänen-RAG | **Klein** |
| **Vision (Pantry)** | Nur Gemini | ONNX/CLIP teilweise | **Mittel** |
| **Worker-Infrastruktur** | `WorkerBus` + `embedding.worker.ts`, `nutritionWorker` | Dedizierte LLM/Vision-Worker | **Mittel** |
| **Onboarding** | `LocalAiSetupModal` (GPU, Embeddings, WebLLM) | Variiert | **Klein (Vorteil)** |
| **Security / i18n** | Zod, `sanitizeForPrompt`, i18n-Gates grün | Vergleichbar | **Klein (Vorteil)** |

**Fazit:** CulinaSync hat seit **M11 (PR #67)** eine echte **local-first**-Schicht mit Hybrid-RAG und Transformers-Embeddings. Layer 2 (ONNX Vision), Cook-Mode-Assistent und vollständige generative L3-Pfade bleiben Follow-ups.

---

## 2. CulinaSync — KI-Iststand (aktualisiert)

### 2.1 `packages/ai-core`

| Modul | Funktion | Reife |
|-------|----------|-------|
| `sanitizeForPrompt.ts` | Prompt-Härtung | ✅ produktiv |
| `workerBus.ts` | 4-Prioritäts-Job-Queue | ✅ — App: `localAiWorkerBus.ts` |
| `config/gpuTier.ts`, `modelRegistry.ts` | GPU-Tier, Modell-IDs | ✅ |
| `providers/providerChain.ts` | Layer-Fallback | ✅ |
| `engines/localAiWebLlmEngine.ts` | WebLLM L1 | ✅ opt-in |
| `engines/localAiTransformersEngine.ts` | Embeddings L3 | ✅ |
| `engines/localAiHeuristicEngine.ts` | L4 Wrapper | ✅ |
| `optionalMlImports.ts` | Dynamischer Import WebLLM / Transformers | ✅ genutzt |

**Nicht vorhanden:** `localAiOnnxEngine`, dedizierte `llm.worker.ts` / `vision.worker.ts` in `ai-core`.

### 2.2 App-Schicht (`apps/web/src/services/`)

| Datei | Rolle |
|-------|-------|
| `aiProviderService.ts` | **Zentrale Routing-Schicht** — local-first, RAG, Provider-Chain |
| `localAiRagService.ts` | Hybrid-RAG (keyword + semantic) |
| `localAiEmbeddingsService.ts` | Dexie `aiEmbeddings`, Indexierung, semantische Suche |
| `embeddingWorkerService.ts` | Embeddings off Main Thread |
| `localAiWebLlmService.ts` | WebLLM-Orchestrierung für Rezept-Ideen/-Generierung |
| `geminiService.ts` | Cloud-Fassade (BYOK) |
| `aiService.ts` | Re-Export / Kompatibilität → `aiProviderService` |
| `aiOfflineFallback.ts` | Layer-4-Heuristik |

### 2.3 RAG-Quellen (Dexie v13)

| `sourceType` | Indexierung | Retrieval |
|--------------|-------------|-----------|
| `recipe` | DB-Hook `recipes` | `useRecipeHistoryContext` |
| `pantry` | DB-Hook `pantry` | `usePantryContext` |
| `mealPlan` | DB-Hook `mealPlan` | `useMealPlanContext` |

Semantische Suche nutzt Dexie-**Pre-Filter** per `sourceType` (kein `toArray()` + In-Memory-Filter mehr).

### 2.4 Workers (`apps/web/src/workers/`)

| Worker | Zweck |
|--------|-------|
| `nutritionWorker.ts` | Deterministische Nährwert-Analyse |
| `embedding.worker.ts` | Transformers `embedText` off Main Thread |

### 2.5 Settings & Onboarding

- Default: `routingMode: 'local-first'`, `localAi.enabled: true`, `enableWebLlmInference: false`
- `localAi.setupWizardCompleted` — Einmal-Assistent (`LocalAiSetupModal`)
- Panel: Einstellungen → Lokale KI

### 2.6 Verbleibende Gaps (priorisiert)

| ID | Gap | Priorität |
|----|-----|-----------|
| G6 | Cook-Mode KI-Assistent | P0 |
| G7 | Pantry-Vision (ONNX) ohne Cloud | P1 |
| G10 | Inference-Cache (TTL) produktiv | P1 |
| G13 | Ollama-Connector | P2 |
| G16 | Dedizierter WebLLM-Worker | P2 |

---

## 3. i18n & Tests

- Neue Keys: `localAiSetup.*`, `onboarding.localAi.*` (de/en `features.json`)
- Tests: `localAiEmbeddingsService.test.ts`, `localAiRagService.test.ts` (inkl. Meal-Plan)

---

## 4. Verwandte Dokumente

- [LOCAL-AI-ARCHITECTURE.md](./LOCAL-AI-ARCHITECTURE.md) — Zielarchitektur & Phasenplan  
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Gesamt-Layer-Diagramm  
- [PRD.md](../PRD.md) — Feature-Anforderungen (§5.5 KI)
