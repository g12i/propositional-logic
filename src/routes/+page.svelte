<script lang="ts">
	import { normalizeAndSplitChars } from '$lib/utils/text-utils';
	import { buildHierarchy } from '$lib/hierarchy';
	import { parse } from '$lib/ast';
	import { isTautology } from '$lib/solver';

	let sentence = $state('');
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

	const handleInput = (event: Event) => {
		const value = (event.target as HTMLInputElement).value;
		const normalized = normalizeAndSplitChars(value);
		sentence = normalized.join('');
	};
</script>

<div class="container mx-auto py-16">
	<div class="grid grid-cols-2 gap-4">
		<div>
			<input type="text" value={sentence} oninput={handleInput} />
			{#if tautology}
				✅
			{:else}
				❌
			{/if}
		</div>
		<div>
			<pre>{parsed instanceof Error ? parsed.message : JSON.stringify(parsed, null, 2)}</pre>
		</div>
	</div>
</div>
