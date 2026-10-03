/**
 * Titres, descriptions et H1 de toutes les pages indexables. Centralisés pour être contrôlés
 * par les tests (longueurs, unicité, mots-clés « gratuit » et « sans pub »).
 */
import type { FormatId } from '$lib/formats';
import {
	CONVERSIONS,
	conversionTitle,
	HUB_FORMATS,
	hubSlug,
	seoName,
	sourceName,
	targetName,
	type Conversion
} from './conversions';

export interface PageMeta {
	path: string;
	/** Balise <title> : 60 caractères max. (affichage Google) et 70 octets (Discord). */
	title: string;
	/** Meta description : 110 à 160 caractères. */
	description: string;
	h1: string;
}

export const HOME: PageMeta = {
	path: '/',
	title: 'Convertisseur d’images gratuit et sans pub — Convertio',
	description:
		'Convertissez gratuitement vos images HEIC, PNG, JPG, WebP, AVIF, SVG… Sans pub, sans inscription, sans limite : tout se fait dans votre navigateur.',
	h1: 'Convertisseur d’images gratuit et sans pub'
};

export function conversionMeta(conversion: Conversion): PageMeta {
	const source = sourceName(conversion);
	const target = targetName(conversion);
	return {
		path: `/${conversion.slug}`,
		title: `Convertir ${conversionTitle(conversion)} gratuitement, sans pub — Convertio`,
		description: `Convertissez vos fichiers ${source} en ${target} gratuitement, sans pub ni inscription. La conversion se fait dans votre navigateur : vos images restent chez vous.`,
		h1: `Convertir ${source} en ${target} gratuitement`
	};
}

export function hubMeta(format: FormatId): PageMeta {
	const name = seoName(format);
	const examples = (['heic', 'png', 'jpeg', 'webp', 'avif', 'svg'] as FormatId[])
		.filter((id) => id !== format)
		.slice(0, 5)
		.map(seoName)
		.join(', ');
	return {
		path: `/${hubSlug(format)}`,
		title: `Convertir en ${name} gratuitement, sans pub — Convertio`,
		description: `Convertissez vos images en ${name} gratuitement : ${examples}… Sans pub ni inscription, directement dans votre navigateur.`,
		h1: `Convertir une image en ${name}`
	};
}

/** Toutes les pages indexables : sitemap, llms.txt et tests. */
export function allPages(): PageMeta[] {
	return [HOME, ...HUB_FORMATS.map(hubMeta), ...CONVERSIONS.map(conversionMeta)];
}
