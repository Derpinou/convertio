import { INPUT_FORMATS, OUTPUT_FORMATS, FORMATS } from '$lib/formats';
import { absoluteUrl, OG_IMAGE, REPOSITORY_URL, SITE_NAME } from '$lib/site';
import type { FaqItem } from './copy';

type JsonLd = Record<string, unknown>;

const CONTEXT = 'https://schema.org';

export function webApplication(description: string): JsonLd {
	return {
		'@context': CONTEXT,
		'@type': 'WebApplication',
		name: SITE_NAME,
		url: absoluteUrl('/'),
		description,
		image: absoluteUrl(OG_IMAGE.path),
		applicationCategory: 'MultimediaApplication',
		operatingSystem: 'Tous (navigateur web)',
		browserRequirements: 'Nécessite JavaScript et WebAssembly',
		inLanguage: 'fr',
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
		featureList: [
			`Lecture : ${INPUT_FORMATS.map((id) => FORMATS[id].label).join(', ')}`,
			`Conversion en : ${OUTPUT_FORMATS.map((id) => FORMATS[id].label).join(', ')}`,
			'Conversion 100 % locale, sans envoi sur un serveur',
			'Fonctionne hors ligne (PWA)',
			'Conversion par lots et archive ZIP'
		],
		sameAs: [REPOSITORY_URL]
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
