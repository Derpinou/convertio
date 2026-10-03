import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Isolation cross-origin : donne accès à SharedArrayBuffer, donc aux codecs multithread
 * (encodage AVIF nettement plus rapide). Les mêmes en-têtes sont posés en prod via static/_headers.
 */
const crossOriginIsolation = {
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Embedder-Policy': 'require-corp'
};

/** `server.headers` ne s'applique pas aux pages rendues par SvelteKit : on passe par un middleware. */
function crossOriginIsolationHeaders(): Plugin {
	const middleware = (
		_req: unknown,
		res: { setHeader(name: string, value: string): void },
		next: () => void
	) => {
		for (const [name, value] of Object.entries(crossOriginIsolation)) res.setHeader(name, value);
		next();
	};
	return {
		name: 'convertio:cross-origin-isolation',
		configureServer: (server) => void server.middlewares.use(middleware),
		configurePreviewServer: (server) => void server.middlewares.use(middleware)
	};
}

const imageExtensions = [
	'.jpg',
	'.jpeg',
	'.png',
	'.webp',
	'.avif',
	'.gif',
	'.bmp',
	'.ico',
	'.tif',
	'.tiff',
	'.heic',
	'.heif',
	'.jxl',
	'.svg'
];

export default defineConfig({
	plugins: [
		crossOriginIsolationHeaders(),
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'service-worker.ts',
			registerType: 'prompt',
			injectRegister: false,
			manifest: {
				id: '/',
				name: 'Convertio — convertisseur d’images',
				short_name: 'Convertio',
				description:
					'Convertissez vos images (HEIC, PNG, JPEG, WebP, AVIF…) directement dans votre navigateur, sans les envoyer sur un serveur.',
				lang: 'fr',
				dir: 'ltr',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				orientation: 'any',
				background_color: '#ffffff',
				theme_color: '#4f46e5',
				categories: ['utilities', 'photo', 'productivity'],
				icons: [
					{ src: '/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
					{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
					{
						src: '/maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				],
				// « Partager vers Convertio » depuis la galerie (Android / Chromium).
				share_target: {
					action: '/share-target',
					method: 'POST',
					enctype: 'multipart/form-data',
					params: { files: [{ name: 'images', accept: ['image/*', ...imageExtensions] }] }
				},
				// « Ouvrir avec Convertio » (Chrome / Edge sur ordinateur).
				file_handlers: [{ action: '/', accept: { 'image/*': imageExtensions } }],
				launch_handler: { client_mode: 'focus-existing' },
				// Raccourcis (appui long sur l'icône de l'app installée).
				shortcuts: [
					{ name: 'HEIC en JPG', url: '/heic-en-jpg' },
					{ name: 'PNG en WebP', url: '/png-en-webp' },
					{ name: 'WebP en JPG', url: '/webp-en-jpg' },
					{ name: 'SVG en PNG', url: '/svg-en-png' }
				],
				// Captures affichées dans la fenêtre d'installation (`pnpm generate-assets`).
				screenshots: [
					{
						src: '/screenshots/desktop.png',
						sizes: '1280x800',
						type: 'image/png',
						form_factor: 'wide',
						label: 'Conversion de photos HEIC en JPEG'
					},
					{
						src: '/screenshots/mobile.png',
						sizes: '780x1688',
						type: 'image/png',
						form_factor: 'narrow',
						label: 'Conversion de photos HEIC en JPEG sur mobile'
					}
				]
			},
			injectManifest: {
				// Les codecs .wasm (plusieurs Mo) ne sont pas précachés : ils sont mis en cache
				// à leur première utilisation (voir src/service-worker.ts).
				globPatterns: [
					'client/**/*.{js,css,ico,png,svg,webp,woff2,webmanifest}',
					'prerendered/**/*.html'
				],
				// Seuls les jeux de caractères latins de la police sont utiles hors ligne.
				globIgnores: [
					'**/inter-{cyrillic,greek,vietnamese}*',
					// Images destinées aux réseaux sociaux et à la fenêtre d'installation.
					'client/og-image.png',
					'client/screenshots/**'
				]
			},
			devOptions: { enabled: false }
		})
	],
	worker: { format: 'es' },
	optimizeDeps: {
		// Les paquets jSquash chargent leur .wasm via `new URL(..., import.meta.url)` :
		// le pré-bundling de Vite casserait ces chemins.
		exclude: [
			'@jsquash/avif',
			'@jsquash/jpeg',
			'@jsquash/jxl',
			'@jsquash/oxipng',
			'@jsquash/png',
			'@jsquash/resize',
			'@jsquash/webp'
		]
	},
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
