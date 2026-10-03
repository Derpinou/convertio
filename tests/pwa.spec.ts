import { expect, test } from '@playwright/test';
import {
	fixture,
	items,
	MAGIC,
	openApp,
	readOutput,
	selectFormat,
	waitForConversions
} from './helpers';

// Le contrôle fin des service workers n'est fiable que dans Chromium avec Playwright.
test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium uniquement');

test('expose un manifeste installable', async ({ request }) => {
	const response = await request.get('/manifest.webmanifest');
	expect(response.ok()).toBe(true);
	const manifest = await response.json();
	expect(manifest).toMatchObject({
		short_name: 'Convertio',
		display: 'standalone',
		start_url: '/'
	});
	expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === 'maskable')).toBe(
		true
	);
	expect(manifest.share_target.action).toBe('/share-target');
	for (const icon of manifest.icons) {
		expect((await request.get(icon.src)).ok(), icon.src).toBe(true);
	}
});

test('fonctionne entièrement hors ligne une fois les codecs téléchargés', async ({
	page,
	context
}) => {
	await openApp(page);
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

	await page.getByRole('button', { name: 'Rendre disponible hors ligne' }).click();
	await expect(page.getByTestId('offline-ready')).toBeVisible({ timeout: 60_000 });

	await context.setOffline(true);
	await page.reload();
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	// Conversions qui nécessitent des codecs WebAssembly, sans réseau.
	for (const [file, format] of [
		['photo.heic', 'avif'],
		['transparent.png', 'jxl']
	] as const) {
		await selectFormat(page, format);
		await page.locator('#file-upload').setInputFiles(fixture(file));
	}
	await waitForConversions(page, 2);
	await expect(items(page).nth(0)).toHaveAttribute('data-status', 'done');
	await expect(items(page).nth(1)).toHaveAttribute('data-status', 'done');
	expect(MAGIC.jxl((await readOutput(page, 1)).bytes)).toBe(true);
});

test('reçoit les images partagées depuis une autre application', async ({ page }) => {
	await openApp(page);
	await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

	// Simule l'envoi du système de partage (POST multipart vers l'action du share_target).
	const status = await page.evaluate(async () => {
		const blob = await fetch('/pwa-192x192.png').then((response) => response.blob());
		const body = new FormData();
		body.append('images', new File([blob], 'partage.png', { type: 'image/png' }));
		const response = await fetch('/share-target', { method: 'POST', body });
		return response.status;
	});
	expect(status).toBe(200);

	await selectFormat(page, 'webp');
	await page.reload();
	await waitForConversions(page, 1);
	await expect(items(page).first()).toContainText('partage.webp');
	await expect(items(page).first()).toContainText('192 × 192');
});

test('hors ligne : pages visitées disponibles, les autres renvoient vers l’accueil', async ({
	page,
	context
}) => {
	await openApp(page);
	await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
	await page.goto('/heic-en-jpg');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('HEIC en JPG');

	await context.setOffline(true);
	await page.reload();
	await expect(page.getByRole('heading', { level: 1 })).toContainText('HEIC en JPG');

	await page.goto('/svg-en-png');
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Convertisseur d’images');
});
