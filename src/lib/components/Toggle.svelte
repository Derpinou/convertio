<script lang="ts">
	let {
		id,
		label,
		description,
		checked = $bindable(false)
	}: { id: string; label: string; description?: string; checked?: boolean } = $props();
</script>

<div class="flex items-center justify-between gap-4">
	<span class="flex grow flex-col">
		<label for={id} class="text-sm/6 font-medium text-gray-900 dark:text-white">{label}</label>
		{#if description}
			<span id="{id}-description" class="text-sm text-gray-500 dark:text-gray-400">
				{description}
			</span>
		{/if}
	</span>
	<div
		class="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500"
	>
		<span
			class="size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5"
		></span>
		<input
			{id}
			type="checkbox"
			role="switch"
			bind:checked
			aria-describedby={description ? `${id}-description` : undefined}
			class="absolute inset-0 size-full cursor-pointer appearance-none focus:outline-hidden"
		/>
	</div>
</div>
