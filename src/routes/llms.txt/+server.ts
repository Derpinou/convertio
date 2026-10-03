/**
 * Résumé du site pour les assistants et moteurs de réponse IA (convention llms.txt).
 * https://llmstxt.org
 */
import { CONVERSIONS, HUB_FORMATS } from '$lib/seo/conversions';
import { GENERAL_FAQ } from '$lib/seo/copy';
import { conversionMeta, HOME, hubMeta } from '$lib/seo/pages';
import { absoluteUrl, REPOSITORY_URL } from '$lib/site';

export const prerender = true;

export function GET() {
	const link = (meta: { title: string; path: string; description: string }) =>
		`- [${meta.title.replace(/ — Convertio$/, '')}](${absoluteUrl(meta.path)}): ${meta.description}`;
	const body = [
		'# Convertio',
		'',
		`> ${HOME.description}`,
		'',
		'Convertio est un convertisseur de formats d’image 100 % gratuit, sans publicité, sans inscription et sans traceur. La conversion se fait localement dans le navigateur (WebAssembly) : aucun fichier n’est envoyé sur un serveur. L’application fonctionne hors ligne une fois installée (PWA) et son code source est libre.',
		'',
		'Formats lus : HEIC/HEIF, JPEG/JFIF, PNG, WebP, AVIF, GIF, SVG, TIFF, BMP, ICO, JPEG XL. Formats produits : JPEG, PNG, WebP, AVIF, GIF, ICO, BMP, TIFF, JPEG XL.',
		'',
		'## Convertir en un format',
		'',
		...HUB_FORMATS.map((format) => link(hubMeta(format))),
		'',
		'## Conversions',
		'',
		...CONVERSIONS.map((conversion) => link(conversionMeta(conversion))),
		'',
		'## Questions fréquentes',
		'',
		...GENERAL_FAQ.map((item) => `- ${item.question} ${item.answer}`),
		'',
		'## Optional',
		'',
		`- [Code source](${REPOSITORY_URL}): projet libre sous licence Apache 2.0.`,
		''
	].join('\n');
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
