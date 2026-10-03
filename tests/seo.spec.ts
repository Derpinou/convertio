import { expect, test } from '@playwright/test';
import { fixture, MAGIC, readOutput, waitForConversions } from './helpers';

test('page de conversion : contenu, méta-données et format présélectionné', async ({ page }) => {
	await page.goto('/heic-en-jpg');
	await expect(page).toHaveTitle('Convertir HEIC en JPG gratuitement, sans envoi — Convertio');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Convertir HEIC en JPG');
	await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /\/heic-en-jpg$/);
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
		'content',
		/^https:\/\/.+\/og-image\.png$/
	);
	await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /HEIC en JPG/);

	const jsonLd = await page
		.locator('script[type="application/ld+json"]')
		.evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? '')));
	expect(jsonLd.map((data) => data['@type'])).toEqual(['BreadcrumbList', 'FAQPage']);

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
	expect(types).toEqual(['WebApplication', 'FAQPage']);
	await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /^https:\/\/.+\/$/);
});

test('sitemap et robots.txt listent toutes les pages', async ({ request }) => {
	const sitemap = await (await request.get('/sitemap.xml')).text();
	const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
	expect(urls).toHaveLength(21);
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
