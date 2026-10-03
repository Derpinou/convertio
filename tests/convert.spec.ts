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

test.beforeEach(async ({ page }) => {
	await openApp(page);
});

test('la page se charge sans erreur, isolée et protégée par la CSP', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	await page.reload();
	await expect(page).toHaveTitle(/Convertio/);
	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'Convertisseur d’images gratuit'
	);
	expect(await page.evaluate(() => crossOriginIsolated)).toBe(true);
	await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveAttribute(
		'content',
		/connect-src 'self'/
	);
	expect(errors).toEqual([]);
});

test('convertit un PNG transparent en JPEG, sur fond blanc, et le télécharge', async ({ page }) => {
	await selectFormat(page, 'jpeg');
	await page.locator('#file-upload').setInputFiles(fixture('transparent.png'));
	await waitForConversions(page, 1);
	await expect(items(page).first()).toHaveAttribute('data-status', 'done');
	await expect(items(page).first()).toContainText('512 × 512');

	const downloadPromise = page.waitForEvent('download');
	await items(page)
		.first()
		.getByRole('link', { name: /Télécharger/ })
		.click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe('transparent.jpg');
	const { bytes } = await readOutput(page);
	expect(MAGIC.jpeg(bytes)).toBe(true);
});

for (const format of ['png', 'webp', 'avif', 'gif', 'ico', 'bmp', 'tiff', 'jxl']) {
	test(`aller-retour PNG → ${format} → PNG`, async ({ page }) => {
		await selectFormat(page, format);
		await page.locator('#file-upload').setInputFiles(fixture('transparent.png'));
		await waitForConversions(page, 1);
		await expect(items(page).first()).toHaveAttribute('data-status', 'done');
		const output = await readOutput(page);
		expect(MAGIC[format](output.bytes), `signature ${format}`).toBe(true);

		// Le fichier produit est relu par l'application.
		await page.getByRole('button', { name: 'Vider' }).click();
		await selectFormat(page, 'png');
		await page
			.locator('#file-upload')
			.setInputFiles({ name: output.name, mimeType: '', buffer: output.bytes });
		await waitForConversions(page, 1);
		await expect(items(page).first()).toHaveAttribute('data-status', 'done');
		await expect(items(page).first()).toContainText(format === 'ico' ? '256 × 256' : '512 × 512');
		expect(MAGIC.png((await readOutput(page)).bytes)).toBe(true);
	});
}

test('lit les formats produits par d’autres logiciels (HEIC, TIFF, GIF, BMP, JPEG)', async ({
	page
}) => {
	const files = ['photo.heic', 'photo.tiff', 'photo.gif', 'photo.bmp', 'photo.jpg'];
	await selectFormat(page, 'webp');
	await page.locator('#file-upload').setInputFiles(files.map(fixture));
	await waitForConversions(page, files.length);
	for (let i = 0; i < files.length; i++) {
		await expect(items(page).nth(i), files[i]).toHaveAttribute('data-status', 'done');
		await expect(items(page).nth(i)).toContainText('320 × 240');
	}
});

test('respecte l’orientation EXIF des photos', async ({ page }) => {
	await selectFormat(page, 'png');
	await page.locator('#file-upload').setInputFiles(fixture('rotated.jpg'));
	await waitForConversions(page, 1);
	await expect(items(page).first()).toContainText('20 × 40');
});

test('rastérise un SVG à la taille demandée', async ({ page }) => {
	await selectFormat(page, 'png');
	await page.locator('#file-upload').setInputFiles(fixture('logo.svg'));
	await waitForConversions(page, 1);
	await expect(items(page).first()).toContainText('512 × 512');

	await page
		.getByLabel('Taille de rendu des SVG')
		.selectOption({ label: '1024 px (côté le plus long)' });
	await page.getByRole('button', { name: /Appliquer les réglages/ }).click();
	await expect(items(page).first()).toContainText('1024 × 1024');
});

test('signale les fichiers non pris en charge', async ({ page }) => {
	await page.locator('#file-upload').setInputFiles(fixture('notes.txt'));
	await waitForConversions(page, 1);
	await expect(items(page).first()).toHaveAttribute('data-status', 'error');
	await expect(items(page).first()).toContainText('Format de fichier non pris en charge.');
});

test('reconvertit les fichiers après un changement de réglage', async ({ page }) => {
	await selectFormat(page, 'jpeg');
	await page.locator('#file-upload').setInputFiles(fixture('wide.png'));
	await waitForConversions(page, 1);
	await expect(items(page).first()).toContainText('wide.jpg');

	await selectFormat(page, 'webp');
	await expect(items(page).first()).toContainText('Anciens réglages');
	await page.getByRole('button', { name: 'Appliquer les réglages (1)' }).click();
	await expect(items(page).first()).toContainText('wide.webp');
	await expect(items(page).first()).not.toContainText('Anciens réglages');
});

test('télécharge plusieurs fichiers dans une archive ZIP', async ({ page }) => {
	await selectFormat(page, 'webp');
	await page.locator('#file-upload').setInputFiles([fixture('wide.png'), fixture('photo.jpg')]);
	await waitForConversions(page, 2);
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Tout télécharger (.zip)' }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toMatch(/^convertio-\d{8}-\d{4}\.zip$/);
});

test('mémorise les réglages', async ({ page }) => {
	await selectFormat(page, 'avif');
	await page.locator('#quality').evaluate((input: HTMLInputElement) => {
		input.value = '42';
		input.dispatchEvent(new Event('input', { bubbles: true }));
	});
	await page.reload();
	await page.waitForFunction(
		() => document.querySelector<HTMLInputElement>('input[name=format]:checked')?.value === 'avif'
	);
	await expect(page.locator('#quality')).toHaveValue('42');
});
