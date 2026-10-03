/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

const SHARE_CACHE = 'convertio-share-target';

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
	if (event.data?.type === 'CLAIM') event.waitUntil(self.clients.claim());
});

// Contrôle la page dès la première visite : les codecs chargés ensuite passent par le cache.
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Interface de l'application (pages, JS, CSS, icônes) : précachée à l'installation.
// Les pages sont servies hors ligne quels que soient les paramètres d'URL (?utm…).
precacheAndRoute(self.__WB_MANIFEST, { ignoreURLParametersMatching: [/.*/] });
cleanupOutdatedCaches();

// Codecs WebAssembly : téléchargés à la première utilisation puis servis depuis le cache.
// Leurs noms contiennent un hash : une nouvelle version produit une nouvelle URL.
registerRoute(
	({ url, sameOrigin }) => sameOrigin && url.pathname.endsWith('.wasm'),
	new CacheFirst({
		cacheName: 'convertio-codecs',
		plugins: [new ExpirationPlugin({ maxEntries: 60, purgeOnQuotaError: true })]
	})
);

// « Partager vers Convertio » (Web Share Target) : on stocke les fichiers reçus,
// puis on redirige vers l'application qui les récupère au démarrage.
registerRoute(
	({ url, sameOrigin }) => sameOrigin && url.pathname === '/share-target',
	async ({ request }) => {
		const formData = await request.formData();
		const files = formData.getAll('images').filter((entry): entry is File => entry instanceof File);
		const cache = await caches.open(SHARE_CACHE);
		await Promise.all(
			files.map((file, i) =>
				cache.put(
					`/shared/${Date.now()}-${i}`,
					new Response(file, {
						headers: {
							'content-type': file.type || 'application/octet-stream',
							'x-file-name': encodeURIComponent(file.name || `image-${i + 1}`)
						}
					})
				)
			)
		);
		return Response.redirect('/', 303);
	},
	'POST'
);
