<script lang="ts">
	import { parse } from '$lib/ast';
	import AstVisualization from '$lib/components/ast-visualisation.svelte';
	import BooleanTable from '$lib/components/boolean-table.svelte';
	import TiptapEditor from '$lib/components/tiptap-editor.svelte';
	import { buildHierarchy } from '$lib/hierarchy';
	import { isContradiction, isTautology } from '$lib/solver';
	import { normalizeSentence } from '$lib/utils/text-utils';
	import { Bug, Check, CircleDashed, Network, Table2, X } from '@lucide/svelte';
	import type { Editor } from '@tiptap/core';

	let sentence = $state('');

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

	let status = $derived(
		sentence.length === 0
			? ('empty' as const)
			: parsed instanceof Error
				? ('error' as const)
				: tautology
					? ('tautology' as const)
					: contradiction
						? ('contradiction' as const)
						: ('mixed' as const),
	);
</script>

<div class="py-8 flex flex-col gap-6">
	<div class="container mx-auto px-6 flex flex-col gap-6">
		<h1 class="text-heading-1 font-heading-1">Kalkulator KRZ</h1>

		<TiptapEditor
			initialContent={sentence}
			placeholder="Wprowadź wyrażenie logiki zdaniowej (np. p∨~p)"
			onupdate={handleEditorUpdate}
		/>
	</div>

	<div
		class={[
			'py-2',
			{
				'bg-error-200 border-error-900 text-error-900':
					status === 'error' || status === 'contradiction',
				'bg-success-200 border-success-900 text-success-900': status === 'tautology',
				'bg-warning-200 border-warning-900 text-warning-900': status === 'mixed',
				'bg-neutral-200 border-neutral-900 text-neutral-900': status === 'empty',
			},
		]}
	>
		<div class="container mx-auto px-6 flex items-center gap-2">
			{#if status === 'error'}
				<Bug size={20} />
				Błąd składni! Upewnij się, że wyrażenie jest poprawne.
			{:else if status === 'tautology'}
				<Check size={20} />
				<span>Tautologia — Prawdziwa dla wszystkich wartościowań</span>
			{:else if status === 'contradiction'}
				<X size={20} />
				<span>Kontrtautologia — Fałszywa dla wszystkich wartościowań</span>
			{:else if status === 'mixed'}
				<CircleDashed size={20} />
				<span><strong>Zdanie spełnialne</strong> - Prawdziwa dla niektórych wartościowań</span>
			{:else if status === 'empty'}
				<span>Wprowadź formułę</span>
			{/if}
		</div>
	</div>
	<div class="container mx-auto px-6">
		<div class="grid grid-rows-2 md:grid-cols-2 md:grid-rows-1 gap-4">
			<div
				class="border border-neutral-200 rounded-md overflow-hidden flex flex-col"
				style="height: 600px;"
			>
				<div class="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
					<h3 class="text-heading-3 font-heading-3 flex items-center gap-2">
						<Network size={20} color="var(--color-neutral-500)" />
						Drzewo składni
					</h3>
				</div>
				<div class="flex-1 overflow-hidden flex items-center justify-center px-4">
					{#if sentence.length > 0 && !(parsed instanceof Error)}
						<AstVisualization ast={parsed} />
					{:else}
						<span class="text-neutral-500"
							>Wprowadź poprawną formułę, aby zobaczyć drzewo składni.</span
						>
					{/if}
				</div>
			</div>
			<div class="border border-neutral-200 rounded-md overflow-hidden flex flex-col">
				<div class="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
					<h3 class="text-heading-3 font-heading-3 flex items-center gap-2">
						<Table2 size={20} color="var(--color-neutral-500)" />
						Tabela prawdy
					</h3>
				</div>
				<div class="flex-1 overflow-auto flex items-center justify-center px-4">
					{#if sentence.length > 0 && !(parsed instanceof Error)}
						<BooleanTable class="w-full h-full" ast={parsed} />
					{:else}
						<span class="text-neutral-500"
							>Wprowadź poprawną formułę, aby zobaczyć tabelę wartości.</span
						>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
