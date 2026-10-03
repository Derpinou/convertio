import { error } from '@sveltejs/kit';
import { CONVERSIONS, findConversion } from '$lib/seo/conversions';
import type { EntryGenerator, PageLoad } from './$types';

/** Une page prérendue par conversion du catalogue. */
export const entries: EntryGenerator = () => CONVERSIONS.map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const conversion = findConversion(params.slug);
	if (!conversion) error(404, 'Conversion inconnue');
	return { conversion };
};
