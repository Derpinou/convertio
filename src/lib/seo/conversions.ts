import { FORMATS, OUTPUT_FORMATS, type FormatId } from '$lib/formats';

/** Nom utilisé dans les URL et les textes : on cherche « jpg » bien plus que « jpeg ». */
const SEO_NAMES: Partial<Record<FormatId, string>> = { jpeg: 'JPG' };
const SLUG_NAMES: Partial<Record<FormatId, string>> = { jpeg: 'jpg' };

export const seoName = (id: FormatId) => SEO_NAMES[id] ?? FORMATS[id].label;
const slugName = (id: FormatId) => SLUG_NAMES[id] ?? id;

/** « le JPG », « l’AVIF » (élision devant une voyelle). */
export function withArticleName(name: string, capitalize = false): string {
	const article = /^[AEIOUY]/i.test(name) ? 'l’' : 'le ';
	return `${capitalize ? article[0].toUpperCase() + article.slice(1) : article}${name}`;
}

export const withArticle = (id: FormatId, capitalize = false) =>
	withArticleName(seoName(id), capitalize);

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
	note: string;
	/** Conseils pratiques propres à cette conversion. */
	tips?: string[];
	/** Nom du format source quand il diffère du format technique (JFIF = JPEG). */
	fromName?: string;
	/** Présentation du format source, quand `fromName` est défini. */
	fromAbout?: string;
}

const PAIRS: Omit<Conversion, 'slug'>[] = [
	{
		from: 'heic',
		to: 'jpeg',
		group: 'iphone',
		note: 'Les iPhone enregistrent leurs photos en HEIC, un format que Windows, de nombreux sites et logiciels n’ouvrent pas. Le JPG se lit partout : idéal pour envoyer, imprimer ou publier vos photos.',
		tips: [
			'Pour que votre iPhone prenne directement des photos en JPG : Réglages → Appareil photo → Formats → « Le plus compatible ».',
			'Lors d’un transfert vers un ordinateur, Réglages → Photos → « Automatique » convertit aussi les photos en JPG, mais pas celles envoyées par AirDrop ou par e-mail.',
			'Une qualité de 85 conserve tous les détails de vos photos avec un fichier raisonnable.'
		]
	},
	{
		from: 'heic',
		to: 'png',
		group: 'iphone',
		note: 'Le PNG conserve chaque pixel de vos photos iPhone sans nouvelle compression : pratique avant une retouche, au prix de fichiers plus lourds.',
		tips: [
			'Le PNG d’une photo pèse souvent 3 à 5 fois plus que le JPG : préférez le JPG pour l’envoi.',
			'Les portraits et Live Photos sont convertis à partir de leur image principale.'
		]
	},
	{
		from: 'heic',
		to: 'webp',
		group: 'iphone',
		note: 'Le WebP produit des fichiers légers et lisibles par tous les navigateurs : parfait pour mettre vos photos iPhone en ligne.',
		tips: [
			'Une qualité de 75 à 80 suffit pour un site web : la différence est invisible à l’écran.'
		]
	},
	{
		from: 'png',
		to: 'webp',
		group: 'web',
		note: 'Un PNG converti en WebP est souvent deux à trois fois plus léger, transparence comprise : vos pages se chargent plus vite.',
		tips: [
			'Pour un logo ou une capture d’écran, activez « Sans perte » : le fichier reste identique au pixel près et souvent plus léger que le PNG.'
		]
	},
	{
		from: 'jpeg',
		to: 'webp',
		group: 'web',
		note: 'À qualité visuelle égale, le WebP est sensiblement plus léger que le JPG. Une conversion simple pour accélérer un site.',
		tips: [
			'Gardez une qualité proche de celle d’origine (75 à 85) pour éviter d’accumuler les pertes.'
		]
	},
	{
		from: 'png',
		to: 'avif',
		group: 'web',
		note: 'L’AVIF offre aujourd’hui la meilleure compression : vos images PNG deviennent bien plus légères, avec transparence.',
		tips: ['L’encodage AVIF est plus lent : comptez quelques secondes par image sur un téléphone.']
	},
	{
		from: 'jpeg',
		to: 'avif',
		group: 'web',
		note: 'Passer du JPG à l’AVIF divise souvent le poids des photos par deux, sans différence visible.',
		tips: ['Une qualité de 50 à 65 suffit généralement : l’AVIF reste net même à qualité basse.']
	},
	{
		from: 'png',
		to: 'jpeg',
		group: 'web',
		note: 'Pour les photos, le JPG est bien plus léger que le PNG. La transparence éventuelle est remplacée par la couleur de fond de votre choix.',
		tips: [
			'Pour une capture d’écran avec du texte, restez en PNG ou passez en WebP : le JPG rend les contours flous.'
		]
	},
	{
		from: 'webp',
		to: 'jpeg',
		group: 'compat',
		note: 'Les images enregistrées depuis le web sont souvent en WebP, que certains logiciels (anciennes versions de Photoshop, suites bureautiques…) n’ouvrent pas.',
		tips: [
			'Les WebP animés sont convertis à partir de leur première image.',
			'Les zones transparentes reçoivent la couleur de fond choisie (blanc par défaut).'
		]
	},
	{
		from: 'webp',
		to: 'png',
		group: 'compat',
		note: 'Le PNG garde la transparence de vos images WebP et s’ouvre dans tous les logiciels de retouche.',
		tips: [
			'Idéal pour réutiliser un logo ou une illustration WebP dans un document ou une présentation.'
		]
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
		from: 'jpeg',
		to: 'jpeg',
		fromName: 'JFIF',
		fromAbout:
			'Le JFIF est en réalité un fichier JPEG portant une autre extension : Windows et certains navigateurs enregistrent ainsi les images téléchargées. Beaucoup de sites et de logiciels refusent pourtant l’extension .jfif.',
		group: 'compat',
		note: 'Un fichier .jfif est refusé par un formulaire ou un logiciel ? Convertissez-le en véritable .jpg, accepté partout, en quelques secondes.',
		tips: [
			'Gardez une qualité élevée (90) pour ne pas dégrader l’image, déjà compressée en JPEG.',
			'Sous Windows, renommer l’extension en .jpg fonctionne parfois, mais la conversion garantit un fichier conforme.'
		]
	},
	{
		from: 'tiff',
		to: 'jpeg',
		group: 'compat',
		note: 'Les scans et exports en TIFF sont très lourds. En JPG, ils deviennent faciles à envoyer par e-mail ou à publier.',
		tips: ['Pour un document scanné avec du texte, une qualité de 90 garde les caractères nets.']
	},
	{
		from: 'tiff',
		to: 'png',
		group: 'compat',
		note: 'Le PNG conserve la qualité intégrale de vos fichiers TIFF, avec une compression sans perte et une compatibilité universelle.',
		tips: ['Pour un TIFF de plusieurs pages, c’est la plus grande image qui est convertie.']
	},
	{
		from: 'gif',
		to: 'jpeg',
		group: 'compat',
		note: 'Le JPG s’ouvre partout et convient mieux aux images photographiques que le GIF, limité à 256 couleurs.',
		tips: ['Seule la première image d’un GIF animé est convertie.']
	},
	{
		from: 'bmp',
		to: 'jpeg',
		group: 'compat',
		note: 'Un BMP n’est pas compressé : converti en JPG, il pèse souvent vingt fois moins et devient facile à partager.'
	},
	{
		from: 'jpeg',
		to: 'png',
		group: 'compat',
		note: 'Convertir un JPG en PNG évite toute perte supplémentaire lors des prochaines retouches. Le fichier sera en revanche plus lourd.',
		tips: [
			'La conversion n’ajoute pas de transparence : le fond de l’image reste tel quel.',
			'Elle ne récupère pas non plus la qualité perdue par la compression JPG d’origine.'
		]
	},
	{
		from: 'svg',
		to: 'png',
		group: 'graphics',
		note: 'Réseaux sociaux, messageries et suites bureautiques n’acceptent pas toujours le SVG. Le PNG, rendu à la taille de votre choix, garde la transparence.',
		tips: [
			'Choisissez une taille de rendu (jusqu’à 4096 px) : le SVG étant vectoriel, l’image reste parfaitement nette.'
		]
	},
	{
		from: 'svg',
		to: 'jpeg',
		group: 'graphics',
		note: 'Rendez votre SVG en JPG pour l’insérer dans un document ou l’envoyer à quelqu’un qui n’a pas de logiciel vectoriel.'
	},
	{
		from: 'svg',
		to: 'ico',
		group: 'graphics',
		note: 'Transformez le logo SVG de votre site en favicon ICO, avec toutes les tailles attendues par les navigateurs et Windows.',
		tips: [
			'Un logo simple, sans détails fins, reste lisible en 16 × 16 px.',
			'Gardez aussi votre SVG : les navigateurs récents acceptent directement un favicon SVG.'
		]
	},
	{
		from: 'png',
		to: 'ico',
		group: 'graphics',
		note: 'Créez le favicon de votre site : toutes les tailles utiles (16, 32, 48… 256 px) sont réunies dans un seul fichier ICO.',
		tips: [
			'Partez d’une image carrée d’au moins 256 × 256 px ; une image rectangulaire est centrée sur fond transparent.'
		]
	},
	{
		from: 'jpeg',
		to: 'ico',
		group: 'graphics',
		note: 'Transformez une photo ou un logo JPG en icône ICO pour un site web, un raccourci ou un dossier Windows.',
		tips: ['Le JPG n’ayant pas de transparence, l’icône garde le fond de l’image d’origine.']
	},
	{
		from: 'png',
		to: 'gif',
		group: 'graphics',
		note: 'Le GIF reste lu partout, des anciens logiciels aux messageries : pratique pour un logo ou une illustration simple.',
		tips: [
			'La transparence est conservée, mais sur un seul niveau : les bords adoucis deviennent nets.'
		]
	},
	{
		from: 'jpeg',
		to: 'gif',
		group: 'graphics',
		note: 'Convertissez un JPG en GIF pour un outil, un forum ou une plateforme qui n’accepte que ce format.',
		tips: ['Le GIF est limité à 256 couleurs : une photo peut perdre en finesse dans les dégradés.']
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

export const sourceName = (conversion: Conversion) =>
	conversion.fromName ?? seoName(conversion.from);
export const targetName = (conversion: Conversion) => seoName(conversion.to);

export const CONVERSIONS: Conversion[] = PAIRS.map((pair) => ({
	...pair,
	slug: `${pair.fromName?.toLowerCase() ?? slugName(pair.from)}-en-${slugName(pair.to)}`
}));

const BY_SLUG = new Map(CONVERSIONS.map((conversion) => [conversion.slug, conversion]));

export const findConversion = (slug: string) => BY_SLUG.get(slug);

export const conversionTitle = (conversion: Conversion) =>
	`${sourceName(conversion)} en ${targetName(conversion)}`;

export function groupedConversions(exclude?: string) {
	return (Object.keys(GROUP_LABELS) as ConversionGroup[]).map((group) => ({
		group,
		label: GROUP_LABELS[group],
		conversions: CONVERSIONS.filter((c) => c.group === group && c.slug !== exclude)
	}));
}

/** Conversions qui partagent le format source ou cible. */
export function relatedConversions(conversion: Conversion, count: number): Conversion[] {
	return CONVERSIONS.filter(
		(other) =>
			other.slug !== conversion.slug &&
			(other.from === conversion.from || other.to === conversion.to)
	).slice(0, count);
}

/* Pages « Convertir en JPG », « Convertir en PNG »… : une par format de sortie. */

export const HUB_FORMATS: FormatId[] = OUTPUT_FORMATS;

export const hubSlug = (format: FormatId) => `convertir-en-${slugName(format)}`;

const HUB_BY_SLUG = new Map(HUB_FORMATS.map((format) => [hubSlug(format), format]));

export const findHub = (slug: string) => HUB_BY_SLUG.get(slug);

export const conversionsTo = (format: FormatId) => CONVERSIONS.filter((c) => c.to === format);
