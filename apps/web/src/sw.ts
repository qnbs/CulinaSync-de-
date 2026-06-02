/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

// QNBS-v3: SPA-Navigation aus Precache (index.html), nicht nur NetworkFirst — stabiler Offline-Start
const precachedIndex =
  self.__WB_MANIFEST.map((entry) => (typeof entry === 'string' ? entry : entry.url)).find((url) =>
    url.endsWith('index.html'),
  ) ?? '/index.html';
const navigationHandler = createHandlerBoundToURL(precachedIndex);

registerRoute(
  new NavigationRoute(navigationHandler, {
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
  }),
);

registerRoute(
  ({ url }) =>
    /\/assets\/(jspdf\.es\.min-|html2canvas\.esm-|papaparse\.min-|index\.es-).+\.js$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'export-libs-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 12,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

registerRoute(
  ({ url }) =>
    /\/assets\/(vendor-scanner-|vendor-tour-|vendor-faker-|vendor-workbox-|vendor-export-|vendor-misc-).+\.js$/.test(
      url.pathname,
    ),
  new CacheFirst({
    cacheName: 'heavy-vendor-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 24,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

// QNBS-v3: Lazy-Route-Chunks nach erstem Besuch offline nutzbar (PWA P1)
registerRoute(
  ({ request, url }) =>
    request.destination === 'script' &&
    url.pathname.includes('/assets/') &&
    url.pathname.endsWith('.js') &&
    !/\/assets\/(jspdf\.es\.min-|html2canvas\.esm-|papaparse\.min-|index\.es-|vendor-scanner-|vendor-tour-|vendor-faker-|vendor-workbox-|vendor-export-|vendor-misc-)/.test(
      url.pathname,
    ),
  new StaleWhileRevalidate({
    cacheName: 'app-route-chunks',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 48,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'static-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 16,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  }),
);
