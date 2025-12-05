<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		onclick?: (event: MouseEvent) => void;
		class?: ClassValue;
		children?: Snippet;
		size?: 'sm' | 'md';
		variant?: 'primary' | 'secondary' | 'ghost';
		type?: 'button' | 'submit' | 'reset';
	};

	let {
		onclick,
		class: className,
		children,
		size = 'md',
		variant = 'primary',
		type = 'button',
		...rest
	}: Props = $props();
</script>

<button
	{onclick}
	{type}
	class={[
		'border border-solid rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
		size === 'sm' && 'px-2 py-0.5 text-sm',
		size === 'md' && 'px-3 py-1 text-base',
		variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600 border-blue-500',
		variant === 'secondary' && 'bg-gray-500 text-gray-900 hover:bg-gray-600 border-gray-500',
		variant === 'ghost' && 'bg-transparent text-gray-900 hover:bg-gray-100 border-transparent gho',
		className,
	]}
	{...rest}
>
	{@render children?.()}
</button>
