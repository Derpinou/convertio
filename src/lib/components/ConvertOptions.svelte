<script lang="ts">
	import { FORMATS, ICO_SIZES } from '$lib/formats';
	import { converter } from '$lib/state/converter.svelte';
	import { qualityFor, SVG_SIZES } from '$lib/state/preferences';
	import Icon from './Icon.svelte';
	import Toggle from './Toggle.svelte';

	const prefs = $derived(converter.prefs);
	const format = $derived(prefs.format);
	const info = $derived(FORMATS[format]);
	const lossless = $derived(info.losslessOption && (prefs.lossless[format] ?? false));

	const BACKGROUNDS = [
		{ value: '#ffffff', label: 'Blanc' },
		{ value: '#000000', label: 'Noir' }
	];

	function toggleIcoSize(size: number, checked: boolean) {
		const sizes = new Set(prefs.icoSizes);
		if (checked) sizes.add(size);
		else if (sizes.size > 1) sizes.delete(size);
		prefs.icoSizes = [...sizes].sort((a, b) => a - b);
	}
</script>

<div class="space-y-6">
	{#if info.losslessOption}
		<Toggle
			id="lossless"
			label="Sans perte"
			description="Qualité identique à l’original, fichier plus lourd."
			bind:checked={
				() => prefs.lossless[format] ?? false, (value) => (prefs.lossless[format] = value)
			}
		/>
	{/if}

	{#if info.lossy && !lossless}
		<div>
			<div class="flex items-center justify-between">
				<label for="quality" class="text-sm/6 font-medium text-gray-900 dark:text-white">
					Qualité
				</label>
				<span class="text-sm font-semibold text-indigo-600 tabular-nums dark:text-indigo-400">
					{qualityFor(prefs, format)}
				</span>
			</div>
			<input
				id="quality"
				type="range"
				min="1"
				max="100"
				bind:value={() => qualityFor(prefs, format), (value) => (prefs.quality[format] = value)}
				class="mt-2 w-full cursor-pointer accent-indigo-600 dark:accent-indigo-500"
			/>
			<div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
				<span>Fichier léger</span>
				<span>Meilleure qualité</span>
			</div>
		</div>
	{/if}

	{#if !info.alpha}
		<div>
			<span id="background-label" class="text-sm/6 font-medium text-gray-900 dark:text-white">
				Couleur de fond
			</span>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				Le {info.label} ne gère pas la transparence : elle sera remplacée par cette couleur.
			</p>
			<div
				class="mt-3 flex flex-wrap items-center gap-3"
				role="group"
				aria-labelledby="background-label"
			>
				{#each BACKGROUNDS as preset (preset.value)}
					<button
						type="button"
						onclick={() => (prefs.background = preset.value)}
						aria-pressed={prefs.background === preset.value}
						class="inline-flex items-center gap-x-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 aria-pressed:inset-ring-2 aria-pressed:inset-ring-indigo-600 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20 dark:aria-pressed:inset-ring-indigo-500"
					>
						<span
							class="size-4 rounded-full ring-1 ring-gray-900/20 dark:ring-white/20"
							style:background-color={preset.value}
						></span>
						{preset.label}
					</button>
				{/each}
				<label
					class="inline-flex cursor-pointer items-center gap-x-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20"
				>
					<input
						type="color"
						{@attach (input) => {
							// Valeur posée côté client : un attribut `value` prérendu déclenche un
							// avertissement de Chrome quand Svelte le retire à l'hydratation.
							input.value = prefs.background;
						}}
						oninput={(event) => (prefs.background = event.currentTarget.value)}
						class="size-4 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
					/>
					<span class="font-mono text-xs uppercase">{prefs.background}</span>
				</label>
			</div>
		</div>
	{/if}

	{#if format === 'png'}
		<Toggle
			id="png-optimize"
			label="Compression maximale"
			description="Fichier encore plus léger, sans perte de qualité, mais conversion bien plus lente."
			bind:checked={prefs.pngOptimize}
		/>
	{/if}

	{#if format === 'ico'}
		<fieldset>
			<legend class="text-sm/6 font-medium text-gray-900 dark:text-white">Tailles incluses</legend>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				Les tailles plus grandes que l’image d’origine sont ignorées.
			</p>
			<div class="mt-3 flex flex-wrap gap-2">
				{#each ICO_SIZES as size (size)}
					<label
						class="relative cursor-pointer rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-900 tabular-nums outline-1 -outline-offset-1 outline-gray-300 has-checked:bg-indigo-50 has-checked:text-indigo-700 has-checked:outline-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:has-checked:bg-indigo-500/10 dark:has-checked:text-indigo-300 dark:has-checked:outline-indigo-500"
					>
						<input
							type="checkbox"
							checked={prefs.icoSizes.includes(size)}
							onchange={(event) => toggleIcoSize(size, event.currentTarget.checked)}
							class="absolute inset-0 cursor-pointer appearance-none focus:outline-hidden"
						/>
						{size} px
					</label>
				{/each}
			</div>
		</fieldset>
	{/if}

	{#if converter.hasSvg}
		<div>
			<label for="svg-size" class="text-sm/6 font-medium text-gray-900 dark:text-white">
				Taille de rendu des SVG
			</label>
			<div class="mt-2 grid grid-cols-1 sm:max-w-xs">
				<select
					id="svg-size"
					bind:value={prefs.svgSize}
					class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus-visible:outline-indigo-500"
				>
					<option value={null}>Taille d’origine</option>
					{#each SVG_SIZES as size (size)}
						<option value={size}>{size} px (côté le plus long)</option>
					{/each}
				</select>
				<svg
					viewBox="0 0 16 16"
					fill="currentColor"
					aria-hidden="true"
					class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
				>
					<path
						d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
						clip-rule="evenodd"
						fill-rule="evenodd"
					/>
				</svg>
			</div>
		</div>
	{/if}

	<div class="flex gap-x-3 rounded-md bg-gray-50 p-3 dark:bg-white/5">
		<Icon name="information-circle-solid" class="size-5 shrink-0 text-gray-400" />
		<p class="text-sm text-gray-600 dark:text-gray-300">
			{#if format === 'gif'}
				Le GIF est limité à 256 couleurs : idéal pour les logos et illustrations, moins pour les
				photos.
			{:else if format === 'avif'}
				L’AVIF offre les fichiers les plus légers, mais sa conversion est plus lente.
			{:else if format === 'jxl'}
				Le JPEG XL est encore peu lu : Safari le prend en charge, la plupart des autres navigateurs
				non.
			{:else if format === 'ico'}
				Chaque taille est stockée en PNG dans le fichier ICO, compatible avec tous les navigateurs.
			{:else}
				Les métadonnées (EXIF, position GPS…) sont supprimées des fichiers convertis.
			{/if}
		</p>
	</div>
</div>
