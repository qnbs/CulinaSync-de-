/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'nav-pages',
      networkTimeoutSeconds: 5,
    }),
  ),
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
