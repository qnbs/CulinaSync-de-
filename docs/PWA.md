# CulinaSync PWA

Progressive Web App features for local-first kitchen workflows.

## Architecture

| Layer | Responsibility |
|-------|----------------|
| **Service Worker** (`apps/web/src/sw.ts`) | Precache shell, runtime caches, user-controlled `skipWaiting` |
| **Manifest** (`buildPwaManifest` + `vite.config.ts`) | Install metadata, shortcuts, share/file/protocol handlers |
| **IndexedDB (Dexie)** | Domain offline source of truth |
| **Hooks** | `usePwaInstall`, `usePwaUpdate`, `usePwaLaunchHandlers`, `useAppBadge` |

## Manifest capabilities

- **Shortcuts:** pantry, shopping list, recipes, meal planner, AI chef (`?page=…`)
- **Share target:** GET `?pwa-share=1` → AI Chef prompt
- **File handlers:** `.csb` / `.json` → Settings vault import
- **Protocol:** `web+culinasync://` → deep link query (see `useDeepLinkNavigation`)
- **Display:** `standalone` + `minimal-ui` override

## Update flow

1. New SW downloads in background → toast `app.pwa.updateDownloading`
2. `onNeedRefresh` → dialog; user confirms reload
3. App calls `skipWaitingServiceWorker()` then `applyPwaUpdate()`

No automatic `skipWaiting()` on install — avoids interrupting cook flows.

## Offline

- Unvisited lazy routes need one online load (cached via `StaleWhileRevalidate`)
- Heavy chunks (`vendor-export`, scanner) cached on first use
- `OfflineStatusBar` + `useOnlineStatus` (bfcache-aware)

## Settings

**Einstellungen → Daten** → PWA card: install, update check, capability matrix, iOS hint.

## Validation

```bash
pnpm run i18n:check
pnpm exec vitest run apps/web/src/utils/__tests__/pwaShareTarget.test.ts
pnpm exec vitest run apps/web/src/hooks/__tests__/useOnlineStatus.test.ts
```

Manual: DevTools → Application → Manifest / Service Workers; Lighthouse PWA audit.
