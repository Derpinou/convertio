import { warmupCodecs } from '$lib/convert/client';
import { toasts } from './toasts.svelte';

const OFFLINE_KEY = 'convertio:offline-ready';
const CODEC_CACHE = 'convertio-codecs';

export type OfflineState = 'unknown' | 'idle' | 'downloading' | 'ready' | 'error';

function readFlag(key: string): boolean {
	try {
		return localStorage.getItem(key) === '1';
	} catch {
		return false;
	}
}

function writeFlag(key: string, value: boolean) {
	try {
		if (value) localStorage.setItem(key, '1');
		else localStorage.removeItem(key);
	} catch {
		// Stockage indisponible : sans conséquence.
	}
}

class Pwa {
	/** L'app tourne en mode installé (écran d'accueil, fenêtre dédiée). */
	standalone = $state(false);
	isIos = $state(false);
	installEvent = $state<BeforeInstallPromptEvent | null>(null);
	offline = $state<OfflineState>('unknown');
	canInstall = $derived(!this.standalone && (this.installEvent !== null || this.isIos));
	supported = $state(false);

	#updateServiceWorker?: (reloadPage?: boolean) => Promise<void>;

	async init() {
		this.standalone =
			matchMedia('(display-mode: standalone)').matches ||
			(navigator as Navigator & { standalone?: boolean }).standalone === true;
		const ua = navigator.userAgent;
		this.isIos =
			/iP(hone|od|ad)/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);

		window.addEventListener('beforeinstallprompt', (event) => {
			event.preventDefault();
			this.installEvent = event as BeforeInstallPromptEvent;
		});
		window.addEventListener('appinstalled', () => {
			this.installEvent = null;
		});

		this.supported = 'serviceWorker' in navigator;
		if (!this.supported) return;

		const { registerSW } = await import('virtual:pwa-register');
		this.#updateServiceWorker = registerSW({
			immediate: true,
			onNeedRefresh: () => {
				toasts.push({
					kind: 'info',
					title: 'Nouvelle version disponible',
					message: 'Rechargez pour profiter des dernières améliorations.',
					action: { label: 'Recharger', run: () => void this.#updateServiceWorker?.(true) }
				});
			}
		});

		await this.#refreshOfflineState();
		// Une fois installée, on s'attend à ce que l'app marche hors ligne : on précharge tout.
		if (this.standalone && this.offline === 'idle') void this.makeAvailableOffline(true);
	}

	async #refreshOfflineState() {
		const cached = readFlag(OFFLINE_KEY) && (await caches.has(CODEC_CACHE).catch(() => false));
		this.offline = cached ? 'ready' : 'idle';
	}

	async install() {
		const event = this.installEvent;
		if (!event) return;
		await event.prompt();
		await event.userChoice;
		this.installEvent = null;
	}

	/** Télécharge tous les codecs pour que chaque conversion fonctionne sans réseau. */
	async makeAvailableOffline(silent = false) {
		if (this.offline === 'downloading') return;
		this.offline = 'downloading';
		try {
			const registration = await navigator.serviceWorker.ready;
			if (!navigator.serviceWorker.controller) {
				// Première visite : on attend que le service worker prenne le contrôle de la page.
				await Promise.race([
					new Promise<void>((resolve) => {
						navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
							once: true
						});
						registration.active?.postMessage({ type: 'CLAIM' });
					}),
					new Promise((resolve) => setTimeout(resolve, 5000))
				]);
			}
			await warmupCodecs();
			writeFlag(OFFLINE_KEY, true);
			this.offline = 'ready';
			if (!silent) {
				toasts.push({
					kind: 'success',
					title: 'Disponible hors ligne',
					message: 'Toutes les conversions fonctionnent désormais sans connexion.'
				});
			}
		} catch (error) {
			console.error(error);
			writeFlag(OFFLINE_KEY, false);
			this.offline = 'error';
			if (!silent) {
				toasts.push({
					kind: 'error',
					title: 'Téléchargement incomplet',
					message: 'Certains formats ne seront pas disponibles hors ligne. Réessayez plus tard.'
				});
			}
		}
	}
}

export const pwa = new Pwa();
