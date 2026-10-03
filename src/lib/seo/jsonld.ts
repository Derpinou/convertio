import { INPUT_FORMATS, OUTPUT_FORMATS, FORMATS } from '$lib/formats';
import { absoluteUrl, OG_IMAGE, REPOSITORY_URL, SITE_NAME } from '$lib/site';
import type { FaqItem } from './copy';

type JsonLd = Record<string, unknown>;

const CONTEXT = 'https://schema.org';

/** Nom du site dans les résultats Google (« site name »). */
export function webSite(description: string): JsonLd {
	return {
		'@context': CONTEXT,
		'@type': 'WebSite',
		name: SITE_NAME,
		alternateName: 'Convertio, convertisseur d’images gratuit et sans pub',
		url: absoluteUrl('/'),
		description,
		inLanguage: 'fr'
	};
}

const FEATURES = [
	'100 % gratuit, sans abonnement ni limite',
	'Sans publicité, sans cookie ni traceur',
	'Sans inscription',
	'Conversion locale : aucun fichier envoyé sur un serveur',
	'Fonctionne hors ligne (PWA)',
	'Conversion par lots et archive ZIP',
	`Lecture : ${INPUT_FORMATS.map((id) => FORMATS[id].label).join(', ')}`,
	`Conversion en : ${OUTPUT_FORMATS.map((id) => FORMATS[id].label).join(', ')}`
];

/**
 * L'application elle-même. `name`/`url` permettent de décrire aussi chaque page de conversion
 * (« Convertisseur HEIC en JPG »). Aucune note ni avis : rien qui ne soit vérifiable.
 */
export function webApplication(
	description: string,
	page: { name: string; path: string } = { name: SITE_NAME, path: '/' }
): JsonLd {
	return {
		'@context': CONTEXT,
		'@type': 'WebApplication',
		name: page.name,
		url: absoluteUrl(page.path),
		description,
		image: absoluteUrl(OG_IMAGE.path),
		applicationCategory: 'MultimediaApplication',
		operatingSystem: 'Tous (navigateur web)',
		browserRequirements: 'Nécessite JavaScript et WebAssembly',
		inLanguage: 'fr',
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
		featureList: FEATURES,
		sameAs: [REPOSITORY_URL],
		...(page.path !== '/' && {
			isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') }
		})
	};
}

export function breadcrumbs(items: { name: string; path: string }[]): JsonLd {
	return {
		'@context': CONTEXT,
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: absoluteUrl(item.path)
		}))
	};
}

export function faqPage(items: FaqItem[]): JsonLd {
	return {
		'@context': CONTEXT,
		'@type': 'FAQPage',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: { '@type': 'Answer', text: item.answer }
		}))
	};
}

/** Sérialise pour un `<script type="application/ld+json">` sans risque de fermer la balise. */
export function serializeJsonLd(data: JsonLd): string {
	return JSON.stringify(data)
		.replace(/</g, '\\u003c')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}
