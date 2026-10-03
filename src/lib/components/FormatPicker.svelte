<script lang="ts">
	import { FORMATS, OUTPUT_FORMATS } from '$lib/formats';
	import { converter } from '$lib/state/converter.svelte';
</script>

<fieldset>
	<legend class="text-sm/6 font-semibold text-gray-900 dark:text-white">Convertir en</legend>
	<div class="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
		{#each OUTPUT_FORMATS as id (id)}
			{@const info = FORMATS[id]}
			<label
				class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md bg-white px-2 py-3 text-center outline-1 -outline-offset-1 outline-gray-300 has-checked:bg-indigo-600 has-checked:outline-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:has-checked:bg-indigo-500 dark:has-checked:outline-indigo-500"
			>
				<input
					type="radio"
					name="format"
					value={id}
					bind:group={converter.prefs.format}
					class="absolute inset-0 cursor-pointer appearance-none focus:outline-hidden"
				/>
				<span
					class="text-sm font-semibold text-gray-900 group-has-checked:text-white dark:text-white"
				>
					{info.label}
				</span>
				<span
					class="mt-0.5 hidden text-xs text-gray-500 group-has-checked:text-indigo-100 sm:block dark:text-gray-400"
				>
					{info.description}
				</span>
			</label>
		{/each}
	</div>
</fieldset>
