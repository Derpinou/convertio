import { FORMATS, INPUT_FORMATS, type FormatId } from '$lib/formats';
import {
	conversionsTo,
	seoName,
	sourceName,
	targetName,
	withArticle,
	type Conversion
} from './conversions';

/** Présentation de chaque format, reprise dans les pages de conversion. */
export const FORMAT_ABOUT: Record<FormatId, string> = {
	heic: 'Le HEIC (High Efficiency Image Container) est le format photo par défaut des iPhone et iPad. Il compresse très bien, mais reste peu pris en charge en dehors de l’écosystème Apple.',
	jpeg: 'Le JPG (ou JPEG) est le format photo universel : lu par tous les appareils, logiciels et sites. Sa compression avec perte se règle pour trouver le bon compromis entre qualité et poids.',
	png: 'Le PNG est un format sans perte qui gère la transparence. Il est idéal pour les captures d’écran, logos et illustrations, mais lourd pour les photos.',
	webp: 'Le WebP, créé par Google, est conçu pour le web : plus léger que le JPG et le PNG, il gère la transparence et les deux modes de compression, avec ou sans perte.',
	avif: 'L’AVIF est un format moderne issu de la vidéo AV1. C’est aujourd’hui le plus efficace pour réduire le poids des images, mais son encodage est plus lent.',
	jxl: 'Le JPEG XL est un format récent, très efficace avec ou sans perte. Safari le lit, mais la plupart des autres navigateurs et logiciels pas encore.',
	gif: 'Le GIF est un format ancien, limité à 256 couleurs. Il reste répandu pour les petites animations et les graphismes simples.',
	bmp: 'Le BMP est un format Windows historique, sans compression : les fichiers sont fidèles mais très volumineux.',
	ico: 'L’ICO est le format des icônes Windows et des favicons de sites web. Un même fichier contient plusieurs tailles de la même image.',
	tiff: 'Le TIFF est un format de haute qualité utilisé pour l’impression, les scanners et l’archivage. Ses fichiers sont souvent très lourds.',
	svg: 'Le SVG est un format vectoriel : il décrit des formes plutôt que des pixels et peut s’agrandir sans perte. Il doit être « rastérisé » pour devenir une image classique.'
};

/** Quand choisir chaque format de sortie (pages « Convertir en… »). */
export const FORMAT_USE: Partial<Record<FormatId, string>> = {
	jpeg: 'Choisissez le JPG pour partager des photos par e-mail, messagerie ou réseaux sociaux, les imprimer, ou les envoyer sur un site qui n’accepte que ce format.',
	png: 'Choisissez le PNG pour les captures d’écran, logos, schémas et images avec transparence, ou pour retoucher une image sans perte de qualité.',
	webp: 'Choisissez le WebP pour alléger les images d’un site web : il est lu par tous les navigateurs récents et gère la transparence.',
	avif: 'Choisissez l’AVIF pour obtenir les images les plus légères possible sur le web, au prix d’un encodage plus lent.',
	gif: 'Choisissez le GIF pour une plateforme ou un logiciel ancien qui n’accepte que ce format, ou pour un logo très simple.',
	ico: 'Choisissez l’ICO pour créer le favicon d’un site web ou une icône Windows : toutes les tailles utiles sont réunies dans un seul fichier.',
	bmp: 'Choisissez le BMP uniquement pour un logiciel ancien qui l’exige : les fichiers ne sont pas compressés.',
	tiff: 'Choisissez le TIFF pour l’impression professionnelle ou l’archivage, quand le poids des fichiers n’est pas un problème.',
	jxl: 'Choisissez le JPEG XL pour tester ce format d’avenir : très efficace, il n’est toutefois lu que par Safari et quelques logiciels.'
};

/** Réglage conseillé pour chaque format de sortie. */
export const FORMAT_TIP: Partial<Record<FormatId, string>> = {
	jpeg: 'Une qualité de 80 à 90 offre le meilleur compromis entre netteté et poids. En dessous de 70, des défauts deviennent visibles.',
	png: 'Le PNG est toujours sans perte. Activez « Compression maximale » pour gagner encore quelques pourcents de poids, au prix d’une conversion plus lente.',
	webp: 'Une qualité de 75 à 85 suffit pour le web. Pour un logo ou une capture d’écran, le mode « Sans perte » est souvent plus léger que le PNG.',
	avif: 'Une qualité de 50 à 65 suffit généralement : l’AVIF reste net même à qualité basse.',
	gif: 'Le GIF est limité à 256 couleurs : idéal pour les aplats, moins pour les photos et les dégradés.',
	ico: 'Gardez au moins les tailles 16, 32, 48 et 256 px : ce sont celles qu’attendent les navigateurs et Windows.',
	bmp: 'Le BMP produit est en 24 bits, la variante la plus compatible. La transparence est remplacée par la couleur de fond.',
	tiff: 'Le TIFF produit n’est pas compressé : parfait pour l’impression, à éviter pour l’envoi.',
	jxl: 'Une qualité de 75 à 90 convient à la plupart des images ; le mode sans perte est aussi disponible.'
};

export interface FaqItem {
	question: string;
	answer: string;
}

/** Questions communes à toutes les pages : la gratuité et l'absence de publicité d'abord. */
export const GENERAL_FAQ: FaqItem[] = [
	{
		question: 'Convertio est-il vraiment gratuit ?',
		answer:
			'Oui, à 100 % : pas d’abonnement, pas de version payante, pas de limite de fichiers ni de taille, pas de filigrane. Toutes les fonctions sont accessibles à tout le monde.'
	},
	{
		question: 'Pourquoi n’y a-t-il pas de publicité ?',
		answer:
			'Parce que Convertio ne coûte presque rien à faire fonctionner : la conversion se fait sur votre appareil, il n’y a donc aucun serveur de calcul à financer. Pas besoin de publicité, d’abonnement ni de revente de données.'
	},
	{
		question: 'Faut-il créer un compte ou donner son e-mail ?',
		answer:
			'Non. Ouvrez la page, déposez vos images, téléchargez le résultat : aucune inscription, aucune adresse e-mail.'
	},
	{
		question: 'Mes images sont-elles envoyées sur un serveur ?',
		answer:
			'Non. Convertio convertit vos images directement dans votre navigateur, grâce à WebAssembly. Aucun fichier n’est transmis : tout reste sur votre appareil, ce qui garantit la confidentialité de vos photos.'
	},
	{
		question: 'Y a-t-il des cookies ou des traceurs ?',
		answer:
			'Aucun cookie, aucune mesure d’audience, aucun traceur publicitaire. Seuls vos réglages (format, qualité…) sont mémorisés dans votre navigateur pour vos prochaines visites.'
	},
	{
		question: 'Y a-t-il une limite de taille ou de nombre de fichiers ?',
		answer:
			'Aucune limite n’est imposée. Déposez autant d’images que vous voulez : seule la mémoire de votre appareil compte (jusqu’à environ 150 mégapixels par image). Vous pouvez tout télécharger d’un coup dans une archive ZIP.'
	},
	{
		question: 'Est-ce que ça marche sur iPhone et Android ?',
		answer:
			'Oui, Convertio fonctionne dans tous les navigateurs récents, sur mobile comme sur ordinateur. Vous pouvez aussi l’installer sur l’écran d’accueil pour l’utiliser comme une application, même hors ligne.'
	},
	{
		question: 'Que deviennent les métadonnées de mes photos ?',
		answer:
			'Les métadonnées (date, appareil, position GPS…) sont supprimées des fichiers convertis. L’orientation de la photo est appliquée avant la conversion pour qu’elle s’affiche dans le bon sens.'
	}
];

/** Questions propres à une conversion, ajoutées avant les questions générales. */
export function conversionFaq(conversion: Conversion): FaqItem[] {
	const { from, to } = conversion;
	const source = sourceName(conversion);
	const target = targetName(conversion);
	const items: FaqItem[] = [
		{
			question: `Comment convertir un fichier ${source} en ${target} gratuitement ?`,
			answer: `Choisissez ou glissez vos fichiers ${source} dans la zone prévue : la conversion en ${target} démarre aussitôt, gratuitement et sans inscription. Cliquez ensuite sur « Télécharger », ou sur « Tout télécharger » pour récupérer une archive ZIP.`
		}
	];
	if (FORMATS[to].lossy) {
		items.push({
			question: `Puis-je régler la qualité de l’image en ${target} ?`,
			answer: `Oui, un curseur de qualité de 1 à 100 permet de choisir entre un fichier plus léger et une meilleure qualité.${
				FORMATS[to].losslessOption
					? ` ${withArticle(to, true)} propose aussi un mode sans perte.`
					: ''
			}`
		});
	}
	if (!FORMATS[to].alpha && FORMATS[from].alpha) {
		items.push({
			question: `La transparence est-elle conservée en ${target} ?`,
			answer: `${withArticle(to, true)} ne gère pas la transparence : les zones transparentes sont remplies avec la couleur de fond de votre choix (blanc par défaut).`
		});
	}
	if (from === 'gif' || from === 'webp') {
		items.push({
			question: 'Les images animées sont-elles prises en charge ?',
			answer:
				'Seule la première image d’une animation est convertie. Convertio est pensé pour les images fixes.'
		});
	}
	if (from === 'svg') {
		items.push({
			question: `À quelle taille le SVG est-il converti en ${target} ?`,
			answer:
				'Par défaut, à sa taille d’origine. Vous pouvez choisir une taille de rendu de 256 à 4096 pixels : le SVG étant vectoriel, l’image reste nette.'
		});
	}
	return [...items, ...GENERAL_FAQ];
}

/** Questions d'une page « Convertir en… ». */
export function hubFaq(format: FormatId): FaqItem[] {
	const name = seoName(format);
	const inputs = INPUT_FORMATS.filter((id) => id !== format).map((id) => seoName(id));
	const items: FaqItem[] = [
		{
			question: `Quels formats puis-je convertir en ${name} ?`,
			answer: `Convertio convertit en ${name} les fichiers ${inputs.join(', ')}. Le format est détecté automatiquement, même si l’extension du fichier est incorrecte.`
		}
	];
	const tip = FORMAT_TIP[format];
	if (tip) items.push({ question: `Quels réglages choisir pour le ${name} ?`, answer: tip });
	return [...items, ...GENERAL_FAQ];
}

/** Ordre des formats sources mis en avant sur une page « Convertir en… ». */
export function hubSources(format: FormatId): FormatId[] {
	return INPUT_FORMATS.filter((id) => id !== format);
}

export const hubConversions = conversionsTo;
