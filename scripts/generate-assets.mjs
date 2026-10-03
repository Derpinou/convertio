#!/usr/bin/env node
/**
 * Génère les images du site avec Playwright (Chromium) :
 * - static/og-image.png : bannière de partage Open Graph, rendue depuis assets/og-image.html ;
 * - static/screenshots/*.png : captures affichées dans la fenêtre d'installation de la PWA,
 *   prises sur le build de production avec les photos d'exemple de assets/samples.
 *
 * Usage : `pnpm generate-assets` (construit le site puis lance un aperçu local temporaire).
 */
import { chromium } from '@playwright/test';
import optimise, { init as initOxipng } from '@jsquash/oxipng/optimise.js';
import { spawn } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4180;
const BASE_URL = `http://localhost:${PORT}`;

/** Recompresse un PNG avec OxiPNG (sans perte), le codec utilisé par l'application. */
async function optimisePng(file) {
	const input = await readFile(file);
	const output = await optimise(
		input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength),
		{ level: 3, optimiseAlpha: true }
	);
	await writeFile(file, new Uint8Array(output));
	const kb = (bytes) => `${Math.round(bytes / 1024)} Ko`;
	console.log(`✓ ${path.relative(root, file)} (${kb(input.length)} → ${kb(output.byteLength)})`);
}

async function renderOgImage(browser) {
	const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
	await page.goto(pathToFileURL(path.join(root, 'assets/og-image.html')).href);
	await page.evaluate(() => document.fonts.ready);
	await page.waitForFunction(() => [...document.images].every((img) => img.complete));
	const file = path.join(root, 'static/og-image.png');
	await page.screenshot({ path: file });
	await page.close();
	await optimisePng(file);
}

async function startPreview() {
	const server = spawn(
		'pnpm',
		['exec', 'vite', 'preview', '--port', String(PORT), '--strictPort'],
		{
			cwd: root,
			stdio: 'ignore'
		}
	);
	for (let i = 0; i < 60; i++) {
		try {
			if ((await fetch(BASE_URL)).ok) return server;
		} catch {
			// Pas encore prêt.
		}
		await delay(500);
	}
	server.kill();
	throw new Error(`L'aperçu ne répond pas sur ${BASE_URL}`);
}

const SCREENSHOTS = [
	{
		name: 'desktop',
		context: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
		// Cadre la zone de dépôt et la liste des fichiers convertis.
		anchor: '#file-upload',
		offset: 40
	},
	{
		name: 'mobile',
		context: {
			viewport: { width: 390, height: 844 },
			deviceScaleFactor: 2,
			isMobile: true,
			hasTouch: true
		},
		anchor: '#file-upload',
		offset: 16
	}
];

async function takeScreenshots(browser) {
	const samplesDir = path.join(root, 'assets/samples');
	const samples = (await readdir(samplesDir)).sort().map((name) => path.join(samplesDir, name));
	await mkdir(path.join(root, 'static/screenshots'), { recursive: true });

	for (const shot of SCREENSHOTS) {
		const context = await browser.newContext({
			...shot.context,
			colorScheme: 'light',
			locale: 'fr-FR',
			serviceWorkers: 'block'
		});
		const page = await context.newPage();
		await page.goto(`${BASE_URL}/heic-en-jpg`);
		await page.waitForFunction(
			() => document.querySelector('input[name=format]:checked')?.getAttribute('value') === 'jpeg'
		);
		await page.locator('#file-upload').setInputFiles(samples);
		await page.waitForFunction(
			(count) =>
				[...document.querySelectorAll('[data-testid=file-item]')].filter(
					(item) => item.getAttribute('data-status') === 'done'
				).length === count,
			samples.length,
			{ timeout: 60_000 }
		);
		await page.waitForFunction(() =>
			[...document.querySelectorAll('[data-testid=file-item] img')].every((img) => img.complete)
		);
		await page.locator(shot.anchor).evaluate((element, offset) => {
			const top = element.closest('label, section')?.getBoundingClientRect().top ?? 0;
			window.scrollTo({ top: window.scrollY + top - offset, behavior: 'instant' });
		}, shot.offset);
		await page.mouse.move(0, 0);
		await delay(300);
		const file = path.join(root, `static/screenshots/${shot.name}.png`);
		await page.screenshot({ path: file });
		await context.close();
		await optimisePng(file);
	}
}

await initOxipng(
	await WebAssembly.compile(
		await readFile(path.join(root, 'node_modules/@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm'))
	)
);

const browser = await chromium.launch();
try {
	await renderOgImage(browser);
	const server = await startPreview();
	try {
		await takeScreenshots(browser);
	} finally {
		server.kill();
	}
} finally {
	await browser.close();
}
