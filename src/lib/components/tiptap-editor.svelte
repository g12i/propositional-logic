<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor, Node } from '@tiptap/core';
	import Paragraph from '@tiptap/extension-paragraph';
	import Placeholder from '@tiptap/extension-placeholder';
	import Text from '@tiptap/extension-text';
	import FloatingMenu from '@tiptap/extension-floating-menu';
	import { AND, OR, IMPL, EQ, NOT } from '$lib/constants';
	import Button from './ui/button.svelte';

	type Props = {
		initialContent: string;
		onupdate: (content: string) => string;
		placeholder?: string;
	};

	let { initialContent = '', onupdate, placeholder }: Props = $props();

	let editorElement = $state<HTMLDivElement>();
	let floatingMenuElement = $state<HTMLDivElement>();
	let editorState = $state<{ editor: Editor | null }>({ editor: null });

	const OneLiner = Node.create({
		name: 'oneLiner',
		topNode: true,
		content: 'block',
	});

	onMount(() => {
		if (!editorElement || !floatingMenuElement) return;

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
							mainAxis: 8
						}
					},
				}),
			],
			editorProps: {
				attributes: {
					class: 'prose prose-sm prose-base focus:outline-none',
				},
			},
			content: initialContent,
			onUpdate: ({ editor }) => {
				const newContent = onupdate(editor.getText());
				editor.commands.setContent(newContent);
				// Force re-render
				editorState = { editor };
			},
			onTransaction: ({ editor }) => {
				// Force re-render for active states
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
		class="flex gap-1 p-1 bg-white border border-gray-300 rounded-lg shadow-sm"
	>
		{#if editorState.editor}
			<Button class="font-mono" size="sm" variant="ghost" onclick={() => insertSymbol(AND)}>
				{AND}
			</Button>
			<Button class="font-mono" size="sm" variant="ghost" onclick={() => insertSymbol(OR)}>
				{OR}
			</Button>
			<Button class="font-mono" size="sm" variant="ghost" onclick={() => insertSymbol(IMPL)}>
				{IMPL}
			</Button>
			<Button class="font-mono" size="sm" variant="ghost" onclick={() => insertSymbol(EQ)}>
				{EQ}
			</Button>
			<Button class="font-mono" size="sm" variant="ghost" onclick={() => insertSymbol(NOT)}>
				{NOT}
			</Button>
			<Button class="font-mono" size="sm" variant="ghost" onclick={() => insertSymbol('(')}>
				(
			</Button>
			<Button class="font-mono" size="sm" variant="ghost" onclick={() => insertSymbol(')')}>
				)
			</Button>
		{/if}
	</div>

	<div
		bind:this={editorElement}
		class="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500"
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
