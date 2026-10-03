import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	defaultPreferences,
	loadPreferences,
	settingsKey,
	toConvertSettings,
	type Preferences
} from './preferences';

function mockStorage(value: string | null) {
	vi.stubGlobal('localStorage', { getItem: () => value, setItem: () => {} });
}

afterEach(() => vi.unstubAllGlobals());

describe('preferences', () => {
	it('revient aux valeurs par défaut sans stockage', () => {
		vi.stubGlobal('localStorage', undefined);
		expect(loadPreferences()).toEqual(defaultPreferences());
	});

	it('ignore les valeurs stockées invalides', () => {
		mockStorage(
			JSON.stringify({
				format: 'heic',
				quality: { jpeg: 500, webp: 70 },
				background: 'rouge',
				icoSizes: [7, 32],
				svgSize: 123
			})
		);
		const prefs = loadPreferences();
		expect(prefs.format).toBe('jpeg');
		expect(prefs.quality).toEqual({ webp: 70 });
		expect(prefs.background).toBe('#ffffff');
		expect(prefs.icoSizes).toEqual([32]);
		expect(prefs.svgSize).toBeNull();
	});

	it('survit à un JSON corrompu', () => {
		mockStorage('{oops');
		expect(loadPreferences()).toEqual(defaultPreferences());
	});

	it('applique la qualité et le mode sans perte du format choisi', () => {
		const prefs: Preferences = {
			...defaultPreferences(),
			format: 'webp',
			quality: { webp: 42, jpeg: 90 },
			lossless: { webp: true }
		};
		expect(toConvertSettings(prefs)).toMatchObject({ format: 'webp', quality: 42, lossless: true });
		expect(toConvertSettings({ ...prefs, format: 'jpeg' })).toMatchObject({
			quality: 90,
			lossless: false
		});
		expect(toConvertSettings({ ...prefs, format: 'avif' }).quality).toBe(60);
	});

	it('ne tient compte que des réglages utiles au format', () => {
		const base = toConvertSettings({ ...defaultPreferences(), format: 'png' });
		const otherBackground = { ...base, background: '#000000', quality: 10 };
		expect(settingsKey(otherBackground, 'jpeg')).toBe(settingsKey(base, 'jpeg'));
		expect(settingsKey({ ...base, pngOptimize: true }, 'jpeg')).not.toBe(settingsKey(base, 'jpeg'));

		const jpeg = toConvertSettings({ ...defaultPreferences(), format: 'jpeg' });
		expect(settingsKey({ ...jpeg, background: '#000000' }, 'png')).not.toBe(
			settingsKey(jpeg, 'png')
		);
	});

	it('la taille de rendu SVG ne compte que pour les fichiers SVG', () => {
		const settings = toConvertSettings(defaultPreferences());
		const bigger = { ...settings, svgSize: 2048 };
		expect(settingsKey(bigger, 'png')).toBe(settingsKey(settings, 'png'));
		expect(settingsKey(bigger, 'svg')).not.toBe(settingsKey(settings, 'svg'));
	});
});
