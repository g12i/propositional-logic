<script lang="ts">
	import { AND, EQ, IMPL, NOT, OR } from '$lib/constants';
	import { Editor, Node } from '@tiptap/core';
	import FloatingMenu from '@tiptap/extension-floating-menu';
	import Paragraph from '@tiptap/extension-paragraph';
	import Placeholder from '@tiptap/extension-placeholder';
	import Text from '@tiptap/extension-text';
	import { onDestroy, onMount } from 'svelte';
	import Button from './ui/button.svelte';

	type Props = {
		initialContent: string;
		onupdate: (editor: Editor) => void;
		placeholder?: string;
	};

	let { initialContent = '', onupdate, placeholder }: Props = $props();

	let editorElement = $state<HTMLDivElement>();
	let floatingMenuElement = $state<HTMLDivElement>();
	let editorState = $state<{ editor: Editor | null }>({ editor: null });
	let focused = $state(false);

	const OneLiner = Node.create({
		name: 'oneLiner',
		topNode: true,
		content: 'block',
	});

	onMount(() => {
		if (!editorElement) return;

		editorState.editor = new Editor({
			element: editorElement,
			extensions: [
				OneLiner,
				Text,
				Paragraph,
				Placeholder.configure({
					placeholder,
					includeChildren: true,
				}),
				FloatingMenu.configure({
					element: floatingMenuElement,
					shouldShow: () => true,
					options: {
						placement: 'top-start',
						offset: {
							mainAxis: 8,
						},
					},
				}),
			],
			editorProps: {
				attributes: {
					class: 'prose prose-sm prose-base focus:outline-none w-full p-4',
				},
			},
			content: initialContent,
			onFocus: () => {
				focused = true;
			},
			onBlur: () => {
				focused = false;
			},
			onUpdate: ({ editor }) => {
				onupdate(editor);
				editorState = { editor };
			},
			onTransaction: ({ editor }) => {
				editorState = { editor };
			},
		});
	});

	onDestroy(() => {
		editorState.editor?.destroy();
	});

	const insertSymbol = (symbol: string) => {
		editorState.editor?.chain().focus().insertContent(symbol).run();
	};
</script>

<div class="relative">
	<div
		bind:this={floatingMenuElement}
		class={[
			'flex gap-1 p-1 bg-white border border-gray-300 rounded-md shadow-sm floating-menu',
			{ 'invisible!': !focused },
		]}
	>
		<Button size="sm" variant="ghost" onclick={() => insertSymbol(AND)}>
			{AND}
		</Button>
		<Button size="sm" variant="ghost" onclick={() => insertSymbol(OR)}>
			{OR}
		</Button>
		<Button size="sm" variant="ghost" onclick={() => insertSymbol(IMPL)}>
			{IMPL}
		</Button>
		<Button size="sm" variant="ghost" onclick={() => insertSymbol(EQ)}>
			{EQ}
		</Button>
		<Button size="sm" variant="ghost" onclick={() => insertSymbol(NOT)}>
			{NOT}
		</Button>
		<Button size="sm" variant="ghost" onclick={() => insertSymbol('(')}>(</Button>
		<Button size="sm" variant="ghost" onclick={() => insertSymbol(')')}>)</Button>
	</div>
	<div
		bind:this={editorElement}
		class="border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-blue-500"
	></div>
</div>

<style>
	:global(.is-editor-empty:first-child::before) {
		height: 0;
		color: var(--content-secondary);
		content: attr(data-placeholder);
		float: left;
		pointer-events: none;
	}
</style>
