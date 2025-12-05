<script lang="ts">
	import { parse } from '$lib/ast';
	import AstVisualization from '$lib/components/ast-visualisation.svelte';
	import TiptapEditor from '$lib/components/tiptap-editor.svelte';
	import { buildHierarchy } from '$lib/hierarchy';
	import { isTautology } from '$lib/solver';
	import { normalizeSentence } from '$lib/utils/text-utils';

	let sentence = $state('');

	const handleEditorUpdate = (content: string): string => {
		sentence = normalizeSentence(content);
		return sentence;
	};

	let parsed = $derived.by(() => {
		try {
			return parse(buildHierarchy(sentence.split('')));
		} catch (error) {
			return error instanceof Error ? error : new Error('Unknown error', { cause: error });
		}
	});
	let tautology = $derived.by(() => {
		return parsed instanceof Error ? false : isTautology(parsed);
	});
</script>

<div class="container mx-auto py-8">
	<div class="mb-6">
		<div class="flex items-center gap-4 mb-4">
			<div class="flex-1">
				<TiptapEditor
					initialContent={sentence}
					placeholder="Wprowadź wyrażenie logiki zdaniowej (np. p∨~p)"
					onupdate={handleEditorUpdate}
				/>
			</div>
			<div class="text-xl pt-2">
				{#if tautology}
					✅ Tautologia
				{:else if parsed instanceof Error}
					❌ Błąd
				{:else}
					❌ Nie jest tautologią
				{/if}
			</div>
		</div>
		{#if parsed instanceof Error}
			<div class="text-red-600 text-sm mt-2">
				<p>Błąd składni! Upewnij się, że wyrażenie jest poprawne.</p>
				<p>{parsed.message}</p>
			</div>
		{/if}
	</div>

	<div class="border border-gray-200 rounded-lg overflow-hidden" style="height: 600px;">
		<AstVisualization ast={parsed} />
	</div>
</div>
