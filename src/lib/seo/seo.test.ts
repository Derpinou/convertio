import { describe, expect, it } from 'vitest';
import { FORMATS } from '$lib/formats';
import { match } from '../../params/conversion';
import {
	CONVERSIONS,
	conversionTitle,
	findConversion,
	groupedConversions,
	withArticle
} from './conversions';
import { conversionFaq, FORMAT_ABOUT } from './copy';
import { breadcrumbs, serializeJsonLd } from './jsonld';

describe('catalogue des conversions', () => {
	it('a des URL uniques, en minuscules', () => {
		const slugs = CONVERSIONS.map((c) => c.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		for (const slug of slugs) expect(slug).toMatch(/^[a-z]+-en-[a-z]+$/);
	});

	it('ne propose que des conversions réalisables', () => {
		for (const { from, to, fromName } of CONVERSIONS) {
			expect(FORMATS[from].input, from).toBe(true);
			expect(FORMATS[to].output, to).toBe(true);
			// Seule exception : une variante nommée du même format (JFIF → JPG).
			if (!fromName) expect(from).not.toBe(to);
		}
	});

	it('nomme le JPEG « JPG », comme le recherchent les internautes', () => {
		const heic = findConversion('heic-en-jpg');
		expect(heic && conversionTitle(heic)).toBe('HEIC en JPG');
	});

	it('valide les paramètres de route', () => {
		expect(match('heic-en-jpg')).toBe(true);
		expect(match('heic-en-gif')).toBe(false);
		expect(match('../etc')).toBe(false);
	});

	it('range chaque conversion dans un groupe du pied de page', () => {
		const grouped = groupedConversions().flatMap((g) => g.conversions);
		expect(grouped).toHaveLength(CONVERSIONS.length);
		expect(groupedConversions('heic-en-jpg').flatMap((g) => g.conversions)).toHaveLength(
			CONVERSIONS.length - 1
		);
	});

	it('présente chaque format', () => {
		for (const id of Object.keys(FORMATS) as (keyof typeof FORMATS)[]) {
			expect(FORMAT_ABOUT[id].length).toBeGreaterThan(40);
		}
	});
});

describe('textes', () => {
	it('élide l’article devant une voyelle', () => {
		expect(withArticle('jpeg')).toBe('le JPG');
		expect(withArticle('avif', true)).toBe('L’AVIF');
		expect(withArticle('ico')).toBe('l’ICO');
	});

	it('adapte la FAQ à la conversion', () => {
		const questions = (slug: string) =>
			conversionFaq(findConversion(slug)!).map((item) => item.question);
		expect(questions('png-en-jpg')).toContain('La transparence est-elle conservée en JPG ?');
		expect(questions('jpg-en-png').join()).not.toContain('transparence');
		expect(questions('png-en-ico').join()).not.toContain('régler la qualité');
		expect(questions('svg-en-png').join()).toContain('taille');
	});
});

describe('données structurées', () => {
	it('empêche de fermer la balise script', () => {
		const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
		expect(json).not.toContain('</script>');
		expect(JSON.parse(json).name).toBe('</script><script>alert(1)</script>');
	});

	it('produit un fil d’Ariane avec des URL absolues', () => {
		const data = breadcrumbs([
			{ name: 'Convertio', path: '/' },
			{ name: 'HEIC en JPG', path: '/heic-en-jpg' }
		]) as { itemListElement: { position: number; item: string }[] };
		expect(data.itemListElement[1]).toMatchObject({ position: 2 });
		expect(data.itemListElement[1].item).toMatch(/^https:\/\/.+\/heic-en-jpg$/);
	});
});
