import { expect, test } from '@playwright/test';
import { fixture, MAGIC, readOutput, waitForConversions } from './helpers';

test('page de conversion : contenu, méta-données et format présélectionné', async ({ page }) => {
	await page.goto('/heic-en-jpg');
	await expect(page).toHaveTitle('Convertir HEIC en JPG gratuitement, sans pub — Convertio');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Convertir HEIC en JPG gratuitement'
	);
	await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /\/heic-en-jpg$/);
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
		'content',
		/^https:\/\/.+\/og-image\.png$/
	);
	await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /HEIC en JPG/);

	const jsonLd = await page
		.locator('script[type="application/ld+json"]')
		.evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? '')));
	expect(jsonLd.map((data) => data['@type'])).toEqual([
		'BreadcrumbList',
		'WebApplication',
		'FAQPage'
	]);

	await expect(page.locator('input[name=format][value=jpeg]')).toBeChecked();
	await page.locator('#file-upload').setInputFiles(fixture('photo.heic'));
	await waitForConversions(page, 1);
	const output = await readOutput(page);
	expect(output.name).toBe('photo.jpg');
	expect(MAGIC.jpeg(output.bytes)).toBe(true);
});

test('le format de la page prime sur le réglage mémorisé', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => document.querySelector('input[name=format]:checked') !== null);
	await page.waitForTimeout(100);
	await page.locator('input[name=format][value=webp]').check();
	await page.goto('/svg-en-png');
	await expect(page.locator('input[name=format][value=png]')).toBeChecked();

	// Navigation interne vers une autre conversion : le format suit.
	await page.getByRole('link', { name: 'PNG en ICO' }).click();
	await expect(page).toHaveURL(/\/png-en-ico$/);
	await expect(page.locator('input[name=format][value=ico]')).toBeChecked();
});

test('l’accueil décrit l’application en données structurées', async ({ page }) => {
	await page.goto('/');
	const types = await page
		.locator('script[type="application/ld+json"]')
		.evaluateAll((scripts) =>
			scripts.map((script) => JSON.parse(script.textContent ?? '')['@type'])
		);
	expect(types).toEqual(['WebSite', 'WebApplication', 'FAQPage']);
	await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /^https:\/\/.+\/$/);
});

test('sitemap et robots.txt listent toutes les pages', async ({ request }) => {
	const sitemap = await (await request.get('/sitemap.xml')).text();
	const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
	expect(urls).toHaveLength(38); // accueil + 9 formats + 28 conversions
	expect(urls.every((url) => url.startsWith('https://'))).toBe(true);
	for (const url of urls.slice(0, 5)) {
		expect((await request.get(new URL(url).pathname)).status(), url).toBe(200);
	}
	const robots = await (await request.get('/robots.txt')).text();
	expect(robots).toMatch(/^Sitemap: https:\/\/.+\/sitemap\.xml$/m);
});

test('les URL inconnues renvoient une erreur 404', async ({ page }) => {
	const response = await page.goto('/heic-en-gif');
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page introuvable');
});

test('la bannière de partage est servie', async ({ request }) => {
	const response = await request.get('/og-image.png');
	expect(response.ok()).toBe(true);
	expect(response.headers()['content-type']).toBe('image/png');
});

test('aperçu Discord avec boutons de conversion, dans le HTML servi', async ({ request }) => {
	for (const [path, firstButton] of [
		['/', 'HEIC → JPG'],
		['/svg-en-png', 'Convertir']
	]) {
		// Discord n'exécute pas de JavaScript : on lit le HTML prérendu, pas le DOM.
		const html = await (await request.get(path)).text();
		const head = html.slice(0, html.indexOf('</head>'));
		const match =
			/<script id="discord:component-embed" type="application\/vnd\.discord\.component-embed\+json">(.*?)<\/script>/s.exec(
				head
			);
		expect(match, path).not.toBeNull();
		const embed = JSON.parse(match![1]);
		expect(embed.component.type).toBe(17);
		expect(JSON.stringify(embed)).toContain(`"label":"${firstButton}"`);
		expect(new TextEncoder().encode(match![1]).length).toBeLessThanOrEqual(3000);
	}
});

test('exploration complète : statuts, H1, canoniques, données structurées et liens internes', async ({
	request
}) => {
	const sitemap = await (await request.get('/sitemap.xml')).text();
	const pages = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
	const titles = new Set<string>();
	const links = new Set<string>();

	for (const path of pages) {
		const response = await request.get(path);
		expect(response.status(), path).toBe(200);
		const html = await response.text();

		expect(html.match(/<h1[\s>]/g), `${path} : un seul H1`).toHaveLength(1);
		const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
		expect(canonical && new URL(canonical).pathname, `${path} : canonique`).toBe(path);
		const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? '';
		expect(titles.has(title), `${path} : titre en double`).toBe(false);
		titles.add(title);
		for (const [, json] of html.matchAll(
			/<script type="application\/ld\+json">(.*?)<\/script>/gs
		)) {
			expect(() => JSON.parse(json), `${path} : JSON-LD`).not.toThrow();
		}
		for (const [, href] of html.matchAll(/<a[^>]+href="(\/[^"#?]*)"/g)) links.add(href);
	}

	for (const href of links) {
		expect((await request.get(href)).status(), `lien interne ${href}`).toBe(200);
	}
	expect(links.size).toBeGreaterThan(30);
});

test('llms.txt résume le site pour les moteurs de réponse IA', async ({ request }) => {
	const text = await (await request.get('/llms.txt')).text();
	expect(text).toMatch(/^# Convertio\n/);
	expect(text).toContain('sans publicité');
	expect(text).toContain('/heic-en-jpg');
	expect(text).toContain('/convertir-en-jpg');
});
