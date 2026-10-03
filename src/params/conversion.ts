import type { ParamMatcher } from '@sveltejs/kit';
import { findConversion } from '$lib/seo/conversions';

/** N'accepte que les conversions du catalogue (`heic-en-jpg`…). */
export const match: ParamMatcher = (param) => findConversion(param) !== undefined;
