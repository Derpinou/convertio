import { FORMATS, type FormatId } from '$lib/formats';

/** Nom utilisé dans les URL et les textes : on cherche « jpg » bien plus que « jpeg ». */
const SEO_NAMES: Partial<Record<FormatId, string>> = { jpeg: 'JPG' };
const SLUG_NAMES: Partial<Record<FormatId, string>> = { jpeg: 'jpg' };

export const seoName = (id: FormatId) => SEO_NAMES[id] ?? FORMATS[id].label;

/** « le JPG », « l’AVIF » (élision devant une voyelle). */
export function withArticle(id: FormatId, capitalize = false): string {
	const name = seoName(id);
	const article = /^[AEIOUY]/i.test(name) ? 'l’' : 'le ';
	return `${capitalize ? article[0].toUpperCase() + article.slice(1) : article}${name}`;
}
const slugName = (id: FormatId) => SLUG_NAMES[id] ?? id;

export type ConversionGroup = 'iphone' | 'web' | 'compat' | 'graphics';

export const GROUP_LABELS: Record<ConversionGroup, string> = {
	iphone: 'Photos iPhone',
	web: 'Pour le web',
	compat: 'Compatibilité',
	graphics: 'Graphisme'
};

export interface Conversion {
	slug: string;
	from: FormatId;
	to: FormatId;
	group: ConversionGroup;
	/** Raison spécifique à ce couple de formats (rend chaque page unique). */
	note?: string;
}

const PAIRS: Omit<Conversion, 'slug'>[] = [
	{
		from: 'heic',
		to: 'jpeg',
		group: 'iphone',
		note: 'Les iPhone enregistrent leurs photos en HEIC, un format que Windows, de nombreux sites et logiciels n’ouvrent pas. Le JPG se lit partout : idéal pour envoyer, imprimer ou publier vos photos.'
	},
	{
		from: 'heic',
		to: 'png',
		group: 'iphone',
		note: 'Le PNG conserve chaque pixel de vos photos iPhone sans nouvelle compression : pratique avant une retouche, au prix de fichiers plus lourds.'
	},
	{
		from: 'heic',
		to: 'webp',
		group: 'iphone',
		note: 'Le WebP produit des fichiers légers et lisibles par tous les navigateurs : parfait pour mettre vos photos iPhone en ligne.'
	},
	{
		from: 'png',
		to: 'webp',
		group: 'web',
		note: 'Un PNG converti en WebP est souvent deux à trois fois plus léger, transparence comprise : vos pages se chargent plus vite.'
	},
	{
		from: 'jpeg',
		to: 'webp',
		group: 'web',
		note: 'À qualité visuelle égale, le WebP est sensiblement plus léger que le JPG. Une conversion simple pour accélérer un site.'
	},
	{
		from: 'png',
		to: 'avif',
		group: 'web',
		note: 'L’AVIF offre aujourd’hui la meilleure compression : vos images PNG deviennent bien plus légères, avec transparence.'
	},
	{
		from: 'jpeg',
		to: 'avif',
		group: 'web',
		note: 'Passer du JPG à l’AVIF divise souvent le poids des photos par deux, sans différence visible.'
	},
	{
		from: 'png',
		to: 'jpeg',
		group: 'web',
		note: 'Pour les photos, le JPG est bien plus léger que le PNG. La transparence éventuelle est remplacée par la couleur de fond de votre choix.'
	},
	{
		from: 'webp',
		to: 'jpeg',
		group: 'compat',
		note: 'Les images enregistrées depuis le web sont souvent en WebP, que certains logiciels (anciennes versions de Photoshop, suites bureautiques…) n’ouvrent pas.'
	},
	{
		from: 'webp',
		to: 'png',
		group: 'compat',
		note: 'Le PNG garde la transparence de vos images WebP et s’ouvre dans tous les logiciels de retouche.'
	},
	{
		from: 'avif',
		to: 'jpeg',
		group: 'compat',
		note: 'L’AVIF est encore mal pris en charge par certains logiciels et anciens appareils. Le JPG fonctionne partout.'
	},
	{
		from: 'avif',
		to: 'png',
		group: 'compat',
		note: 'Le PNG conserve la transparence de vos images AVIF tout en restant lisible par tous les logiciels.'
	},
	{
		from: 'jxl',
		to: 'jpeg',
		group: 'compat',
		note: 'Le JPEG XL n’est lu que par une minorité de navigateurs et de logiciels : le JPG reste le choix le plus sûr pour partager.'
	},
	{
		from: 'tiff',
		to: 'jpeg',
		group: 'compat',
		note: 'Les scans et exports en TIFF sont très lourds. En JPG, ils deviennent faciles à envoyer par e-mail ou à publier.'
	},
	{
		from: 'jpeg',
		to: 'png',
		group: 'compat',
		note: 'Convertir un JPG en PNG évite toute perte supplémentaire lors des prochaines retouches. Le fichier sera en revanche plus lourd.'
	},
	{
		from: 'svg',
		to: 'png',
		group: 'graphics',
		note: 'Réseaux sociaux, messageries et suites bureautiques n’acceptent pas toujours le SVG. Le PNG, rendu à la taille de votre choix, garde la transparence.'
	},
	{
		from: 'svg',
		to: 'jpeg',
		group: 'graphics',
		note: 'Rendez votre SVG en JPG pour l’insérer dans un document ou l’envoyer à quelqu’un qui n’a pas de logiciel vectoriel.'
	},
	{
		from: 'png',
		to: 'ico',
		group: 'graphics',
		note: 'Créez le favicon de votre site : toutes les tailles utiles (16, 32, 48… 256 px) sont réunies dans un seul fichier ICO.'
	},
	{
		from: 'gif',
		to: 'png',
		group: 'graphics',
		note: 'Le PNG n’est pas limité à 256 couleurs et compresse mieux les images fixes que le GIF.'
	},
	{
		from: 'bmp',
		to: 'png',
		group: 'graphics',
		note: 'Le BMP n’est pas compressé : en PNG, la même image pèse souvent dix fois moins, sans aucune perte.'
	}
];

export const CONVERSIONS: Conversion[] = PAIRS.map((pair) => ({
	...pair,
	slug: `${slugName(pair.from)}-en-${slugName(pair.to)}`
}));

const BY_SLUG = new Map(CONVERSIONS.map((conversion) => [conversion.slug, conversion]));

export const findConversion = (slug: string) => BY_SLUG.get(slug);

export const conversionTitle = (conversion: Conversion) =>
	`${seoName(conversion.from)} en ${seoName(conversion.to)}`;

export function groupedConversions(exclude?: string) {
	return (Object.keys(GROUP_LABELS) as ConversionGroup[]).map((group) => ({
		group,
		label: GROUP_LABELS[group],
		conversions: CONVERSIONS.filter((c) => c.group === group && c.slug !== exclude)
	}));
}
