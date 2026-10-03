import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import pkg from './package.json' with { type: 'json' };

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		version: { name: pkg.version },
		// 100 % statique : tout est prérendu, aucun code serveur.
		// `404.html` : servi par Cloudflare avec un statut 404 pour toute URL inconnue
		// (`not_found_handling` dans wrangler.toml), plutôt qu'une page d'accueil en 200.
		adapter: adapter({ strict: true, fallback: '404.html' }),
		// Le service worker est généré par @vite-pwa/sveltekit (src/service-worker.ts) et enregistré par nous.
		serviceWorker: { register: false },
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				// 'wasm-unsafe-eval' : nécessaire pour instancier les codecs WebAssembly.
				'script-src': ['self', 'wasm-unsafe-eval'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'blob:', 'data:'],
				'font-src': ['self'],
				// Aucune requête vers un service tiers : les images ne quittent jamais l'appareil.
				'connect-src': ['self', 'blob:', 'data:'],
				'worker-src': ['self', 'blob:'],
				'manifest-src': ['self'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self']
			}
		}
	}
};

export default config;
