import { describe, expect, it } from 'vitest';
import { CONVERSIONS, HUB_FORMATS } from './conversions';
import { allPages } from './pages';

const pages = allPages();
const bytes = (text: string) => new TextEncoder().encode(text).length;

describe('« linter » SEO des pages', () => {
	it('liste l’accueil, les pages de format et toutes les conversions', () => {
		expect(pages).toHaveLength(1 + HUB_FORMATS.length + CONVERSIONS.length);
		expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
	});

	it.each(pages.map((p) => [p.path, p] as const))('%s : titre et description', (_, page) => {
		// Google tronque vers 60 caractères ; Discord coupe à 70 octets.
		expect(page.title.length, page.title).toBeLessThanOrEqual(60);
		expect(bytes(page.title), page.title).toBeLessThanOrEqual(70);
		expect(page.description.length, page.description).toBeGreaterThanOrEqual(110);
		expect(page.description.length, page.description).toBeLessThanOrEqual(160);
		// Le positionnement : gratuit et sans publicité, partout.
		for (const text of [page.title, page.description]) {
			expect(text.toLowerCase(), text).toContain('gratuit');
			expect(text.toLowerCase(), text).toContain('sans pub');
		}
		expect(page.h1.length).toBeGreaterThan(10);
	});

	it('n’a ni titre, ni description, ni H1 en double', () => {
		for (const key of ['title', 'description', 'h1'] as const) {
			const values = pages.map((p) => p[key]);
			expect(new Set(values).size, key).toBe(values.length);
		}
	});
});
