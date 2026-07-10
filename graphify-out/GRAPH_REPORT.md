# Graph Report - CulinaSync-de-  (2026-07-10)

## Corpus Check
- 420 files · ~176,256 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1017 nodes · 1105 edges · 41 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 242 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]

## God Nodes (most connected - your core abstractions)
1. `retry()` - 25 edges
2. `logAppError()` - 20 edges
3. `downloadFile()` - 17 edges
4. `runLocalGenerative()` - 12 edges
5. `App()` - 11 edges
6. `getAIClient()` - 11 edges
7. `generateRecipe()` - 11 edges
8. `importRecipeFromUrl()` - 10 edges
9. `handleGeminiError()` - 10 edges
10. `generateRecipeIdeas()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `constructBasePrompt()` --calls--> `sanitizeForPrompt()`  [INFERRED]
  apps/web/src/services/aiPromptBuilder.ts → packages/ai-core/src/sanitizeForPrompt.ts
- `runLocalGenerative()` --calls--> `isTransformersLayerEnabled()`  [INFERRED]
  apps/web/src/services/aiProviderService.ts → packages/ai-core/src/engines/localAiTransformersEngine.ts
- `resolveWebLlmModelId()` --calls--> `buildLocalAiRuntimeConfig()`  [INFERRED]
  apps/web/src/services/localAiWebLlmService.ts → packages/ai-core/src/localAiRuntime.ts
- `resolveWebLlmModelId()` --calls--> `resolveGenerativeModel()`  [INFERRED]
  apps/web/src/services/localAiWebLlmService.ts → packages/ai-core/src/config/modelRegistry.ts
- `isSemanticRagAvailable()` --calls--> `buildLocalAiRuntimeConfig()`  [INFERRED]
  apps/web/src/services/localAiEmbeddingsService.ts → packages/ai-core/src/localAiRuntime.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (34): shouldUseOfflineFallback(), buildRuntimeConfigForTests(), generateRecipe(), generateRecipeIdeas(), generateShoppingList(), runLocalGenerative(), toRuntimeInput(), withRag() (+26 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (34): handleGenerateFullRecipe(), handleGenerateIdeas(), updateHistory(), handleSave(), handleSave(), handleAddRecipeToSlot(), handleDrop(), handleSlotClick() (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (29): parseAiJsonWithSchema(), handleAddSelected(), handleClose(), handleGenerate(), constructBasePrompt(), geminiPrompt(), geminiSystem(), buildRecipeIdeasSchema() (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (19): generateChefIdeas(), generateChefImage(), generateChefRecipe(), loadAiChefContext(), handleImageInput(), getBarcodeDetectorCtor(), recognizeTextFromImage(), scanBarcodeFromImage() (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (29): handleExport(), downloadFile(), escapeIcsText(), exportFullDataAsCsv(), exportFullDataAsJson(), exportFullDataAsMarkdown(), exportFullDataAsPdf(), exportFullDataAsTxt() (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (14): App(), canShowNativeInstall(), detectPwaCapabilities(), hasStandaloneDisplay(), useAccentTheme(), useAppBadge(), useDeepLinkNavigation(), useDemoEntryQuery() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (18): mergeBackupWithConflictResolution(), importData(), applyDeviceSyncPayload(), buildDeviceSyncTransferString(), trimForQr(), calculateMatch(), updatePantryMatches(), downloadEncryptedVault() (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (12): isPantryCategoryId(), resolvePantryCategoryLabel(), findFoodEntryByName(), pantryCategoryLabelForFood(), handleNameChange(), getCategoryLabel(), getCategoryLabel(), upsertShoppingListItemInTransaction() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (19): handleDelete(), decryptStoredValue(), deleteApiKey(), deriveEncryptionKey(), encryptApiKey(), fromBase64(), getFingerprint(), hasApiKey() (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.19
Nodes (16): rankByCosineSimilarity(), embedTextInWorker(), getWorker(), getAllowedSourceTypes(), hashContent(), indexMealPlanEmbedding(), indexPantryEmbedding(), indexRecipeEmbedding() (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (16): handleImport(), resetAndClose(), buildGeminiExtractionInput(), defaultRecipe(), extractJsonLdBlocks(), fetchWithFallback(), importRecipeFromJsonString(), importRecipeFromUrl() (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.16
Nodes (14): cloudFirstSettings(), localFirstSettings(), populateDB(), scheduleEmbeddingMaintenance(), debouncedReindexAllEmbeddings(), getDefaultSettings(), isRecord(), mergeSection() (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (8): createTestStore(), componentDidCatch(), render(), renderBar(), renderPantryList(), baseHandlers(), makeItem(), renderItem()

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (13): CulinaSyncDB, applyDbMigrations(), backupDbExists(), ensureMigrationBackup(), getExistingDatabaseVersion(), getStoreSnapshot(), hasBackupForStep(), migrateLegacyPrimaryDatabaseIfNeeded() (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.16
Nodes (7): parseDiff(), hasGermanHint(), ignoreLiteral(), lineIsCodeOnly(), lineUsesI18n(), scanLine(), shouldScanFile()

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (12): sanitizeCsvCell(), handleExport(), handleExportJson(), exportNutritionToHealthCsv(), exportNutritionToHealthJson(), getHealthCsvHeaders(), serializeCsvRow(), serializeCsvValue() (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (4): run(), main(), sanitizeForPrompt(), WorkerBus

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (7): PantryBulkActions(), PantryManagerProvider(), Consumer(), usePantryManagerContext(), useDebounce(), usePantryManager(), useWindowSize()

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (11): buildKeywordChunks(), buildKeywords(), buildLocalAiRagContext(), buildMealPlanKeywordChunks(), buildQueryText(), chunkKey(), enrichPromptWithRag(), mergeChunks() (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (4): dismiss(), handleLoadDemo(), loadDemoPantrySeed(), handleSeedData()

### Community 21 - "Community 21"
Cohesion: 0.42
Nodes (8): buildLocalRecipe(), buildLocalRecipeIdeas(), buildLocalShoppingList(), getPantryHighlights(), getPromptKeywords(), getRecipeTemplateLabels(), getShoppingIntentCatalog(), normalizeToken()

### Community 22 - "Community 22"
Cohesion: 0.36
Nodes (6): buildNextcloudAuth(), buildNextcloudBackupUrl(), probeNextcloudConnection(), trimTrailingSlash(), validateNextcloudConfig(), resolveNextcloudSyncTarget()

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (4): flushPending(), migrateLegacyLocalStorage(), CulinaSyncStateDexie, openStateDexie()

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (3): handleAdd(), handleClose(), handleKeyDown()

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (4): ShoppingListProvider(), Consumer(), useShoppingListContext(), useShoppingList()

### Community 26 - "Community 26"
Cohesion: 0.38
Nodes (3): goToSettings(), goToSettingsData(), openSettingsSection()

### Community 27 - "Community 27"
Cohesion: 0.52
Nodes (6): collectInitialAssets(), main(), normalizeAssetReference(), resolveTransferAsset(), sumByType(), toKilobytes()

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (3): useCookModeController(), useSpeechSynthesis(), useWakeLock()

### Community 30 - "Community 30"
Cohesion: 0.4
Nodes (2): buildAutoPlanSuggestionsFromExpiring(), getDateKey()

### Community 32 - "Community 32"
Cohesion: 0.7
Nodes (4): dispatchDeepLink(), getDeepLinkSegments(), handleDeepLink(), parseDeepLink()

### Community 33 - "Community 33"
Cohesion: 0.5
Nodes (3): handleShare(), shareRecipeToIpfs(), shareRecipeToNostr()

### Community 35 - "Community 35"
Cohesion: 0.5
Nodes (2): useMealPlan(), useMealPlannerScreen()

### Community 36 - "Community 36"
Cohesion: 0.83
Nodes (3): actionUrl(), buildPwaManifest(), normalizeBase()

### Community 38 - "Community 38"
Cohesion: 0.5
Nodes (2): Consumer(), useMealPlannerContext()

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (2): interpolate(), resolveLocaleValue()

### Community 42 - "Community 42"
Cohesion: 0.5
Nodes (2): isSyncErrorCode(), formatSyncErrorMessage()

### Community 44 - "Community 44"
Cohesion: 0.83
Nodes (3): patchFeatures(), patchFile(), patchSettings()

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (2): initWhisper(), transcribeWithWhisper()

### Community 56 - "Community 56"
Cohesion: 0.67
Nodes (1): MockFileReader

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (2): main(), walk()

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (2): flattenKeys(), loadLocaleKeys()

## Knowledge Gaps
- **Thin community `Community 30`** (6 nodes): `mealPlannerSmartService.ts`, `buildAutoPlanSuggestionsFromExpiring()`, `getDateKey()`, `getRecipeScore()`, `getSoonExpiringPantryNames()`, `parseExpiryDaysDiff()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (4 nodes): `useMealPlan.ts`, `useMealPlannerScreen.ts`, `useMealPlan()`, `useMealPlannerScreen()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (4 nodes): `MealPlannerContext.tsx`, `MealPlannerContext.test.tsx`, `Consumer()`, `useMealPlannerContext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (4 nodes): `i18nTestUtils.ts`, `createI18nTestT()`, `interpolate()`, `resolveLocaleValue()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (4 nodes): `syncErrorCodes.ts`, `syncUiErrors.ts`, `isSyncErrorCode()`, `formatSyncErrorMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (3 nodes): `whisperService.ts`, `initWhisper()`, `transcribeWithWhisper()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (3 nodes): `geminiService.test.ts`, `MockFileReader`, `.readAsDataURL()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (3 nodes): `main()`, `walk()`, `generate-webp-assets.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (3 nodes): `flattenKeys()`, `loadLocaleKeys()`, `check-i18n-locale-keys.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logAppError()` connect `Community 0` to `Community 2`, `Community 4`, `Community 6`, `Community 9`, `Community 12`, `Community 13`, `Community 20`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `loadSettings()` connect `Community 12` to `Community 0`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `getCategoryForItem()` connect `Community 7` to `Community 12`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `retry()` (e.g. with `saveApiKey()` and `loadApiKey()`) actually correct?**
  _`retry()` has 24 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `logAppError()` (e.g. with `componentDidCatch()` and `withRag()`) actually correct?**
  _`logAppError()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `runLocalGenerative()` (e.g. with `buildLocalAiRuntimeConfig()` and `resolveGenerativeModel()`) actually correct?**
  _`runLocalGenerative()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `App()` (e.g. with `useOnlineStatus()` and `useDeepLinkNavigation()`) actually correct?**
  _`App()` has 10 INFERRED edges - model-reasoned connections that need verification._