<script lang="ts">
	import { normalizeAndSplitChars } from '$lib/utils/text-utils';
	import { buildHierarchy } from '$lib/hierarchy';
	import { parse } from '$lib/ast';

	let sentence = $state('');
	let hierary = $derived.by(() => {
		try {
			return buildHierarchy(sentence.split(''));
		} catch (error) {
			return error instanceof Error ? error : new Error('Unknown error', { cause: error });
		}
	});
	let parsed = $derived.by(() => {
		try {
			if (hierary instanceof Error) {
				throw hierary;
			}
			return parse(hierary);
		} catch (error) {
			return null;
		}
	});

	const handleInput = (event: Event) => {
		const value = (event.target as HTMLInputElement).value;
		const normalized = normalizeAndSplitChars(value);
		sentence = normalized.join('');
	};
</script>

<div class="container mx-auto py-16">
	<div class="grid grid-cols-3 gap-4">
		<div>
			<input type="text" value={sentence} oninput={handleInput} />
		</div>
		<div>
			<pre>{JSON.stringify(hierary, null, 2)}</pre>
		</div>
		<div>
			<pre>{JSON.stringify(parsed, null, 2)}</pre>
		</div>
	</div>
</div>
