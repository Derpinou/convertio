import { FORMATS, ICO_SIZES, OUTPUT_FORMATS, type FormatId } from '$lib/formats';
import type { ConvertSettings } from '$lib/convert/types';

/** Réglages choisis par l'utilisateur (qualité et mode sans perte mémorisés par format). */
export interface Preferences {
	format: FormatId;
	quality: Partial<Record<FormatId, number>>;
	lossless: Partial<Record<FormatId, boolean>>;
	background: string;
	pngOptimize: boolean;
	icoSizes: number[];
	svgSize: number | null;
}

const STORAGE_KEY = 'convertio:preferences';

export const SVG_SIZES = [256, 512, 1024, 2048, 4096] as const;

export function defaultPreferences(): Preferences {
	return {
		format: 'jpeg',
		quality: {},
		lossless: {},
		background: '#ffffff',
		pngOptimize: false,
		icoSizes: [16, 32, 48, 256],
		svgSize: null
	};
}

function sanitize(value: unknown): Preferences {
	const prefs = defaultPreferences();
	if (!value || typeof value !== 'object') return prefs;
	const raw = value as Partial<Preferences>;
	if (raw.format && OUTPUT_FORMATS.includes(raw.format)) prefs.format = raw.format;
	for (const id of OUTPUT_FORMATS) {
		const quality = raw.quality?.[id];
		if (typeof quality === 'number' && quality >= 1 && quality <= 100) {
			prefs.quality[id] = Math.round(quality);
		}
		if (typeof raw.lossless?.[id] === 'boolean') prefs.lossless[id] = raw.lossless[id];
	}
	if (typeof raw.background === 'string' && /^#[0-9a-f]{6}$/i.test(raw.background)) {
		prefs.background = raw.background;
	}
	if (typeof raw.pngOptimize === 'boolean') prefs.pngOptimize = raw.pngOptimize;
	if (Array.isArray(raw.icoSizes)) {
		const sizes = raw.icoSizes.filter((size) => (ICO_SIZES as readonly number[]).includes(size));
		if (sizes.length) prefs.icoSizes = sizes;
	}
	if (raw.svgSize === null || (SVG_SIZES as readonly unknown[]).includes(raw.svgSize)) {
		prefs.svgSize = raw.svgSize ?? null;
	}
	return prefs;
}

export function loadPreferences(): Preferences {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return sanitize(stored ? JSON.parse(stored) : null);
	} catch {
		return defaultPreferences();
	}
}

export function savePreferences(prefs: Preferences): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
	} catch {
		// Stockage indisponible (navigation privée…) : les réglages ne seront pas mémorisés.
	}
}

export function qualityFor(prefs: Preferences, format: FormatId): number {
	return prefs.quality[format] ?? FORMATS[format].defaultQuality ?? 80;
}

export function toConvertSettings(prefs: Preferences): ConvertSettings {
	return {
		format: prefs.format,
		quality: qualityFor(prefs, prefs.format),
		lossless: FORMATS[prefs.format].losslessOption && (prefs.lossless[prefs.format] ?? false),
		background: prefs.background,
		pngOptimize: prefs.pngOptimize,
		icoSizes: [...prefs.icoSizes].sort((a, b) => a - b),
		svgSize: prefs.svgSize
	};
}

/**
 * Empreinte des seuls réglages qui influencent le résultat pour ce fichier :
 * permet de savoir si une conversion est à refaire après un changement de réglage.
 */
export function settingsKey(settings: ConvertSettings, sourceFormat: FormatId | null): string {
	const info = FORMATS[settings.format];
	const relevant: Record<string, unknown> = { format: settings.format };
	if (info.losslessOption) relevant.lossless = settings.lossless;
	if (info.lossy && !settings.lossless) relevant.quality = settings.quality;
	if (!info.alpha) relevant.background = settings.background;
	if (settings.format === 'png') relevant.pngOptimize = settings.pngOptimize;
	if (settings.format === 'ico') relevant.icoSizes = settings.icoSizes;
	if (sourceFormat === 'svg') relevant.svgSize = settings.svgSize;
	return JSON.stringify(relevant);
}
