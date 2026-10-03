/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/vanillajs" />

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	/** https://developer.mozilla.org/docs/Web/API/BeforeInstallPromptEvent */
	interface BeforeInstallPromptEvent extends Event {
		prompt(): Promise<void>;
		readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
	}

	/** File Handling API (Chromium) : https://developer.mozilla.org/docs/Web/API/LaunchQueue */
	interface LaunchParams {
		readonly files: readonly FileSystemFileHandle[];
	}

	interface LaunchQueue {
		setConsumer(consumer: (params: LaunchParams) => void): void;
	}

	interface Window {
		launchQueue?: LaunchQueue;
	}

	interface ImportMetaEnv {
		/** URL publique du site (ex. https://convertio.example.com), lue au build. */
		readonly VITE_SITE_URL?: string;
	}
}

export {};
