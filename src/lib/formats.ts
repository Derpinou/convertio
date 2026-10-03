export type FormatId =
	'jpeg' | 'png' | 'webp' | 'avif' | 'jxl' | 'gif' | 'bmp' | 'ico' | 'tiff' | 'heic' | 'svg';

export interface FormatInfo {
	id: FormatId;
	label: string;
	mime: string;
	/** Extension utilisée pour les fichiers produits. */
	extension: string;
	/** Toutes les extensions reconnues en entrée. */
	extensions: string[];
	input: boolean;
	output: boolean;
	/** L'encodeur accepte un réglage de qualité. */
	lossy: boolean;
	/** L'encodeur propose un mode sans perte. */
	losslessOption: boolean;
	/** Le format de sortie conserve la transparence. */
	alpha: boolean;
	defaultQuality?: number;
	description: string;
}

export const FORMATS: Record<FormatId, FormatInfo> = {
	jpeg: {
		id: 'jpeg',
		label: 'JPEG',
		mime: 'image/jpeg',
		extension: 'jpg',
		extensions: ['jpg', 'jpeg', 'jpe', 'jfif'],
		input: true,
		output: true,
		lossy: true,
		losslessOption: false,
		alpha: false,
		defaultQuality: 85,
		description: 'Photos, compatible partout'
	},
	png: {
		id: 'png',
		label: 'PNG',
		mime: 'image/png',
		extension: 'png',
		extensions: ['png', 'apng'],
		input: true,
		output: true,
		lossy: false,
		losslessOption: false,
		alpha: true,
		description: 'Sans perte, transparence'
	},
	webp: {
		id: 'webp',
		label: 'WebP',
		mime: 'image/webp',
		extension: 'webp',
		extensions: ['webp'],
		input: true,
		output: true,
		lossy: true,
		losslessOption: true,
		alpha: true,
		defaultQuality: 80,
		description: 'Léger, idéal pour le web'
	},
	avif: {
		id: 'avif',
		label: 'AVIF',
		mime: 'image/avif',
		extension: 'avif',
		extensions: ['avif'],
		input: true,
		output: true,
		lossy: true,
		losslessOption: true,
		alpha: true,
		defaultQuality: 60,
		description: 'Très compressé, plus lent'
	},
	jxl: {
		id: 'jxl',
		label: 'JPEG XL',
		mime: 'image/jxl',
		extension: 'jxl',
		extensions: ['jxl'],
		input: true,
		output: true,
		lossy: true,
		losslessOption: true,
		alpha: true,
		defaultQuality: 80,
		description: 'Nouvelle génération'
	},
	gif: {
		id: 'gif',
		label: 'GIF',
		mime: 'image/gif',
		extension: 'gif',
		extensions: ['gif'],
		input: true,
		output: true,
		lossy: false,
		losslessOption: false,
		alpha: true,
		description: '256 couleurs max.'
	},
	bmp: {
		id: 'bmp',
		label: 'BMP',
		mime: 'image/bmp',
		extension: 'bmp',
		extensions: ['bmp', 'dib'],
		input: true,
		output: true,
		lossy: false,
		losslessOption: false,
		alpha: false,
		description: 'Non compressé'
	},
	ico: {
		id: 'ico',
		label: 'ICO',
		mime: 'image/x-icon',
		extension: 'ico',
		extensions: ['ico', 'cur'],
		input: true,
		output: true,
		lossy: false,
		losslessOption: false,
		alpha: true,
		description: 'Favicon multi-tailles'
	},
	tiff: {
		id: 'tiff',
		label: 'TIFF',
		mime: 'image/tiff',
		extension: 'tiff',
		extensions: ['tif', 'tiff'],
		input: true,
		output: true,
		lossy: false,
		losslessOption: false,
		alpha: true,
		description: 'Impression, archivage'
	},
	heic: {
		id: 'heic',
		label: 'HEIC',
		mime: 'image/heic',
		extension: 'heic',
		extensions: ['heic', 'heif', 'hif'],
		input: true,
		output: false,
		lossy: true,
		losslessOption: false,
		alpha: true,
		description: 'Photos iPhone'
	},
	svg: {
		id: 'svg',
		label: 'SVG',
		mime: 'image/svg+xml',
		extension: 'svg',
		extensions: ['svg'],
		input: true,
		output: false,
		lossy: false,
		losslessOption: false,
		alpha: true,
		description: 'Vectoriel'
	}
};

export const OUTPUT_FORMATS: FormatId[] = [
	'jpeg',
	'png',
	'webp',
	'avif',
	'gif',
	'ico',
	'bmp',
	'tiff',
	'jxl'
];

export const INPUT_FORMATS: FormatId[] = [
	'heic',
	'jpeg',
	'png',
	'webp',
	'avif',
	'gif',
	'svg',
	'tiff',
	'bmp',
	'ico',
	'jxl'
];

/** Valeur de l'attribut `accept` du sélecteur de fichiers. */
export const ACCEPT = [
	'image/*',
	...INPUT_FORMATS.flatMap((id) => FORMATS[id].extensions.map((ext) => `.${ext}`))
].join(',');

export const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256] as const;

const MIME_ALIASES: Record<string, FormatId> = {
	'image/jpg': 'jpeg',
	'image/pjpeg': 'jpeg',
	'image/apng': 'png',
	'image/heif': 'heic',
	'image/heic-sequence': 'heic',
	'image/heif-sequence': 'heic',
	'image/x-ms-bmp': 'bmp',
	'image/vnd.microsoft.icon': 'ico',
	'image/tif': 'tiff'
};

export function extensionOf(name: string): string {
	const dot = name.lastIndexOf('.');
	return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

export function formatFromName(name: string): FormatId | null {
	const ext = extensionOf(name);
	if (!ext) return null;
	for (const info of Object.values(FORMATS)) {
		if (info.extensions.includes(ext)) return info.id;
	}
	return null;
}

export function formatFromMime(mime: string): FormatId | null {
	const type = mime.toLowerCase().split(';')[0].trim();
	if (!type) return null;
	if (type in MIME_ALIASES) return MIME_ALIASES[type];
	for (const info of Object.values(FORMATS)) {
		if (info.mime === type) return info.id;
	}
	return null;
}

/** `vacances.HEIC` + `jpeg` → `vacances.jpg` */
export function outputFileName(name: string, format: FormatId): string {
	const dot = name.lastIndexOf('.');
	const base = (dot > 0 ? name.slice(0, dot) : name) || 'image';
	return `${base}.${FORMATS[format].extension}`;
}

/** Rend les noms uniques (`photo.jpg`, `photo (2).jpg`…) pour une archive ZIP. */
export function dedupeNames(names: string[]): string[] {
	const used = new Set<string>();
	return names.map((name) => {
		let candidate = name;
		let n = 2;
		while (used.has(candidate.toLowerCase())) {
			const dot = name.lastIndexOf('.');
			candidate = dot > 0 ? `${name.slice(0, dot)} (${n})${name.slice(dot)}` : `${name} (${n})`;
			n++;
		}
		used.add(candidate.toLowerCase());
		return candidate;
	});
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} o`;
	const units = ['Ko', 'Mo', 'Go'];
	let value = bytes / 1024;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit++;
	}
	const digits = value < 10 ? 1 : 0;
	return `${value.toLocaleString('fr-FR', { maximumFractionDigits: digits })} ${units[unit]}`;
}
