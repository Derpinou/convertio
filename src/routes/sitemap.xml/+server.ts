import { allPages } from '$lib/seo/pages';
import { absoluteUrl } from '$lib/site';

export const prerender = true;

export function GET() {
	const urls = allPages()
		.map(({ path }) => `\t<url>\n\t\t<loc>${absoluteUrl(path)}</loc>\n\t</url>`)
		.join('\n');
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
