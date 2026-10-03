import { absoluteUrl } from '$lib/site';

export const prerender = true;

export function GET() {
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
