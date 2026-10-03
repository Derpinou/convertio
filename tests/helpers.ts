import { expect, type Page } from '@playwright/test';
import path from 'node:path';

export const fixture = (name: string) => path.join(import.meta.dirname, 'fixtures', name);

export const MAGIC: Record<string, (bytes: Buffer) => boolean> = {
	jpeg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
	png: (b) =>
		b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
	webp: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
	avif: (b) => b.toString('ascii', 4, 8) === 'ftyp' && b.toString('ascii', 8, 12) === 'avif',
	gif: (b) => b.toString('ascii', 0, 6) === 'GIF89a',
	ico: (b) => b.readUInt16LE(0) === 0 && b.readUInt16LE(2) === 1,
	bmp: (b) => b.toString('ascii', 0, 2) === 'BM',
	tiff: (b) => b.toString('ascii', 0, 4) === 'MM\0*' || b.toString('ascii', 0, 4) === 'II*\0',
	jxl: (b) => b[0] === 0xff && b[1] === 0x0a
};

/** Ouvre l'application une fois hydratée (les écouteurs Svelte sont alors actifs). */
export async function openApp(page: Page) {
	await page.goto('/');
	await page.waitForFunction(() => document.querySelector('input[name=format]:checked') !== null);
	await expect(page.locator('#file-upload')).toBeAttached();
	// Laisse le temps à onMount (restauration des réglages) de s'exécuter.
	await page.waitForTimeout(100);
}

export async function selectFormat(page: Page, format: string) {
	await page.locator(`input[name=format][value=${format}]`).check();
}

export function items(page: Page) {
	return page.getByTestId('file-item');
}

/** Attend que tous les fichiers de la liste soient convertis (ou en erreur). */
export async function waitForConversions(page: Page, count: number) {
	await expect(items(page)).toHaveCount(count);
	for (let i = 0; i < count; i++) {
		await expect(items(page).nth(i)).toHaveAttribute('data-status', /^(done|error)$/, {
			timeout: 60_000
		});
	}
}

/** Lit le fichier produit pour l'élément `index` (sans passer par un téléchargement). */
export async function readOutput(page: Page, index = 0): Promise<{ name: string; bytes: Buffer }> {
	const link = items(page).nth(index).locator('a[download]');
	const name = (await link.getAttribute('download')) ?? '';
	const base64 = await link.evaluate(async (anchor: HTMLAnchorElement) => {
		const buffer = await fetch(anchor.href).then((response) => response.arrayBuffer());
		let binary = '';
		const bytes = new Uint8Array(buffer);
		for (let i = 0; i < bytes.length; i += 0x8000) {
			binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
		}
		return btoa(binary);
	});
	return { name, bytes: Buffer.from(base64, 'base64') };
}
