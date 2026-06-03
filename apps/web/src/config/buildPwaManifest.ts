/**
 * Web App Manifest fragments for vite-plugin-pwa.
 * Shortcut labels use German (manifest is static at build time; runtime UI stays i18n).
 */

export type PwaManifestInput = {
  base: string;
};

const normalizeBase = (base: string): string => (base.endsWith('/') ? base : `${base}/`);

const actionUrl = (scope: string, search: string): string => {
  const q = search.startsWith('?') ? search : `?${search}`;
  return `${scope}${q}`.replace(/([^:]\/)\/+/g, '$1');
};

export const buildPwaManifest = ({ base }: PwaManifestInput) => {
  const scope = normalizeBase(base);
  const startUrl = scope;

  return {
    id: 'io.github.qnbs.culinasync',
    name: 'CulinaSync',
    short_name: 'CulinaSync',
    description:
      'Dein kollaborativer kulinarischer Hub für den Haushalt. Offline. Privat. Nahtlos.',
    lang: 'de',
    dir: 'ltr' as const,
    theme_color: '#18181b',
    background_color: '#18181b',
    start_url: startUrl,
    scope,
    display: 'standalone' as const,
    display_override: ['standalone', 'minimal-ui'] as const,
    orientation: 'any' as const,
    categories: ['food', 'lifestyle', 'productivity'],
    prefer_related_applications: false,
    launch_handler: {
      client_mode: 'navigate-existing',
    },
    icons: [
      {
        src: 'logo-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'logo-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    screenshots: [
      {
        src: 'logo-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'CulinaSync — Küchen-Hub',
      },
      {
        src: 'logo-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'wide',
        label: 'CulinaSync — Planung & Vorrat',
      },
    ],
    shortcuts: [
      {
        name: 'Vorratskammer',
        short_name: 'Vorrat',
        description: 'Vorratskammer öffnen',
        url: actionUrl(scope, '?page=pantry'),
        icons: [{ src: 'logo-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Einkaufsliste',
        short_name: 'Liste',
        description: 'Einkaufsliste öffnen',
        url: actionUrl(scope, '?page=shopping-list'),
        icons: [{ src: 'logo-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Rezeptbuch',
        short_name: 'Rezepte',
        description: 'Rezepte durchsuchen',
        url: actionUrl(scope, '?page=recipes'),
        icons: [{ src: 'logo-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Essensplan',
        short_name: 'Plan',
        description: 'Wochenplan öffnen',
        url: actionUrl(scope, '?page=meal-planner'),
        icons: [{ src: 'logo-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'KI-Chef',
        short_name: 'KI-Chef',
        description: 'Neues Rezept mit KI',
        url: actionUrl(scope, '?page=chef'),
        icons: [{ src: 'logo-192x192.png', sizes: '192x192' }],
      },
    ],
    share_target: {
      action: actionUrl(scope, '?pwa-share=1'),
      method: 'GET',
      enctype: 'application/x-www-form-urlencoded',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
      },
    },
    file_handlers: [
      {
        action: actionUrl(scope, '?pwa-file=1'),
        accept: {
          'application/octet-stream': ['.csb'],
          'application/json': ['.json'],
        },
      },
    ],
    protocol_handlers: [
      {
        protocol: 'web+culinasync',
        url: actionUrl(scope, '?culinasync-deeplink=%s'),
      },
    ],
    related_applications: [
      {
        platform: 'webapp',
        url: `${scope}manifest.webmanifest`,
        id: 'io.github.qnbs.culinasync',
      },
    ],
  };
};
