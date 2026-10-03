import { FORMATS, type FormatId } from '$lib/formats';
import { seoName, withArticle, type Conversion } from './conversions';

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

export interface FaqItem {
	question: string;
	answer: string;
}

export const GENERAL_FAQ: FaqItem[] = [
	{
		question: 'Mes images sont-elles envoyées sur un serveur ?',
		answer:
			'Non. Convertio convertit vos images directement dans votre navigateur, grâce à WebAssembly. Aucun fichier n’est transmis : tout reste sur votre appareil, ce qui garantit la confidentialité de vos photos.'
	},
	{
		question: 'Convertio est-il gratuit ?',
		answer:
			'Oui, entièrement : sans inscription, sans limite de fichiers, sans publicité ni filigrane. Le code source est ouvert.'
	},
	{
		question: 'Puis-je convertir plusieurs images à la fois ?',
		answer:
			'Oui. Déposez autant d’images que vous voulez : elles sont converties en parallèle et vous pouvez les télécharger une par une ou toutes ensemble dans une archive ZIP.'
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
export function conversionFaq({ from, to }: Conversion): FaqItem[] {
	const source = seoName(from);
	const target = seoName(to);
	const items: FaqItem[] = [
		{
			question: `Comment convertir un fichier ${source} en ${target} ?`,
			answer: `Choisissez ou glissez vos fichiers ${source} dans la zone prévue : la conversion en ${target} démarre aussitôt. Cliquez ensuite sur « Télécharger », ou sur « Tout télécharger » pour récupérer une archive ZIP.`
		}
	];
	if (FORMATS[to].lossy) {
		items.push({
			question: `Puis-je régler la qualité de l’image en ${target} ?`,
			answer: `Oui, un curseur de qualité de 1 à 100 permet de choisir entre un fichier plus léger et une meilleure qualité.${FORMATS[to].losslessOption ? ` ${withArticle(to, true)} propose aussi un mode sans perte.` : ''}`
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

export function conversionDescription({ from, to }: Conversion): string {
	return `Convertissez vos fichiers ${seoName(from)} en ${seoName(to)} gratuitement, directement dans votre navigateur. Sans inscription, vos images restent sur votre appareil.`;
}
