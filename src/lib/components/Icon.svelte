<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { icons, type IconName } from './icons';

	let {
		name,
		class: className = 'size-6',
		...rest
	}: { name: IconName } & SVGAttributes<SVGSVGElement> = $props();

	const icon = $derived(icons[name]);
	const outline = $derived(icon.variant === 'outline');
	const paths = $derived(icon.paths as SVGAttributes<SVGPathElement>[]);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox={icon.variant === 'solid' ? '0 0 20 20' : '0 0 24 24'}
	fill={outline ? 'none' : 'currentColor'}
	stroke={outline ? 'currentColor' : undefined}
	stroke-width={outline ? 1.5 : undefined}
	aria-hidden="true"
	data-slot="icon"
	class={className}
	{...rest}
>
	{#each paths as path, i (i)}
		<path {...path} />
	{/each}
</svg>
