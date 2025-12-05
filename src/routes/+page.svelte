<script lang="ts">
	import { parse } from '$lib/ast';
	import AstVisualization from '$lib/components/ast-visualisation.svelte';
	import BooleanTable from '$lib/components/boolean-table.svelte';
	import TiptapEditor from '$lib/components/tiptap-editor.svelte';
	import { buildHierarchy } from '$lib/hierarchy';
	import { isContradiction, isTautology } from '$lib/solver';
	import { normalizeSentence } from '$lib/utils/text-utils';
	import { Check, X } from '@lucide/svelte';
	import type { Editor } from '@tiptap/core';

	let sentence = $state('(p∨~p)∨q');

	const handleEditorUpdate = (editor: Editor): void => {
		const startPos = editor.state.selection.from;
		const rawSentence = editor.getText();
		sentence = normalizeSentence(rawSentence);
		editor.commands.setContent(sentence);
		editor.commands.setTextSelection(startPos - (rawSentence.length - sentence.length));
	};

	let parsed = $derived.by(() => {
		try {
			return parse(buildHierarchy(sentence.split('')));
		} catch (error) {
			return error instanceof Error ? error : new Error('Unknown error', { cause: error });
		}
	});

	let tautology = $derived.by(() => (parsed instanceof Error ? false : isTautology(parsed)));

	let contradiction = $derived.by(() =>
		parsed instanceof Error ? false : isContradiction(parsed),
	);
</script>

<div class="container mx-auto py-8 flex flex-col gap-6">
	<TiptapEditor
		initialContent={sentence}
		placeholder="Wprowadź wyrażenie logiki zdaniowej (np. p∨~p)"
		onupdate={handleEditorUpdate}
	/>

	{#if (sentence.length > 0 && parsed instanceof Error) || tautology || contradiction}
		<div
			class={[
				'p-4 rounded-md border border-solid',
				{
					'bg-error-200 border-error-900 text-red-900':
						sentence.length > 0 && parsed instanceof Error,
				},
				{ 'bg-success-200 border-success-900 text-success-900': tautology },
				{ 'bg-warning-200 border-warning-900 text-warning-900': contradiction },
			]}
		>
			{#if sentence.length > 0 && parsed instanceof Error}
				<strong>Błąd składni! Upewnij się, że wyrażenie jest poprawne.</strong>
			{:else if tautology}
				<p class="flex gap-2 items-center">
					<Check />
					<strong> Wyrażenie jest tautologią. Zdanie jest zawsze prawdziwe.</strong>
				</p>
			{:else if contradiction}
				<p class="flex gap-2 items-center">
					<X />
					<strong> Wyrażenie jest kontrtautologią. Zdanie jest zawsze fałszywe.</strong>
				</p>
			{/if}
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-4">
		<div class="border border-gray-200 rounded-md overflow-hidden" style="height: 600px;">
			{#if sentence.length > 0 && !(parsed instanceof Error)}
				<AstVisualization ast={parsed} />
			{/if}
		</div>
		<div class="border border-gray-200 rounded-md overflow-hidden" style="height: 600px;">
			{#if sentence.length > 0 && !(parsed instanceof Error)}
				<BooleanTable ast={parsed} />
			{/if}
		</div>
	</div>
</div>
