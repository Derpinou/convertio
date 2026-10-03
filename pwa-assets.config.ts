import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Génère les icônes PWA à partir du logo : `pnpm generate-pwa-assets`.
// Les fichiers produits sont commités dans static/ (pas de génération au build).
export default defineConfig({
	headLinkOptions: { preset: '2023' },
	preset: {
		...minimal2023Preset,
		maskable: {
			...minimal2023Preset.maskable,
			resizeOptions: { background: '#4f46e5' }
		},
		apple: {
			...minimal2023Preset.apple,
			resizeOptions: { background: '#4f46e5' }
		}
	},
	images: ['static/favicon.svg']
});
