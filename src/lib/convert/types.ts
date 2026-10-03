import type { FormatId } from '$lib/formats';

/** Pixels RGBA 8 bits, compatible avec `ImageData`. */
export interface RawImage {
	data: Uint8ClampedArray;
	width: number;
	height: number;
}

export interface ConvertSettings {
	/** Format de sortie. */
	format: FormatId;
	/** Qualité 1–100 pour les formats avec perte. */
	quality: number;
	/** Mode sans perte (WebP, AVIF, JPEG XL). */
	lossless: boolean;
	/** Couleur de fond pour les formats sans transparence (JPEG, BMP), `#rrggbb`. */
	background: string;
	/** Optimisation PNG poussée (OxiPNG), plus lente. */
	pngOptimize: boolean;
	/** Tailles incluses dans un fichier ICO. */
	icoSizes: number[];
	/** Taille de rendu des SVG (côté le plus long, en px) ; `null` = taille d'origine. */
	svgSize: number | null;
}

export interface ConvertResult {
	blob: Blob;
	width: number;
	height: number;
	/** Vignette PNG (192 px max) de l'image convertie. */
	thumbnail?: Blob;
}

export interface WorkerConfig {
	/** Surface maximale d'un canvas (iOS Safari plafonne à ~16,7 Mpx). */
	maxCanvasPixels: number;
}

export type ConvertErrorCode =
	| 'unsupported-input'
	| 'unsupported-output'
	| 'decode-failed'
	| 'encode-failed'
	| 'too-large'
	| 'svg-in-worker';

/**
 * Erreur métier. Le code est transmis dans `message` car Comlink ne sérialise
 * que `name`, `message` et `stack` des erreurs remontées par le worker.
 */
export class ConvertError extends Error {
	constructor(public readonly code: ConvertErrorCode) {
		super(code);
		this.name = 'ConvertError';
	}
}

const ERROR_MESSAGES: Record<ConvertErrorCode, string> = {
	'unsupported-input': 'Format de fichier non pris en charge.',
	'unsupported-output': 'Format de sortie non pris en charge.',
	'decode-failed':
		'Impossible de lire cette image (fichier corrompu ou variante non prise en charge).',
	'encode-failed': 'La conversion a échoué.',
	'too-large': 'Image trop grande pour être traitée sur cet appareil.',
	'svg-in-worker': 'Erreur interne lors du rendu SVG.'
};

export function errorMessage(error: unknown): string {
	if (error instanceof Error && error.message in ERROR_MESSAGES) {
		return ERROR_MESSAGES[error.message as ConvertErrorCode];
	}
	if (error instanceof RangeError || (error instanceof Error && /memory/i.test(error.message))) {
		return ERROR_MESSAGES['too-large'];
	}
	return ERROR_MESSAGES['encode-failed'];
}
