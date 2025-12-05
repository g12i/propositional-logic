<script lang="ts">
	import { evaluate } from '$lib/solver.js';
	import { createCombinations } from '$lib/utils/array-utils.js';
	import { dfs, isLiteral } from '$lib/utils/ast-utils.js';
	import type { Node } from '../ast.js';

	type Props = {
		ast: Node;
	};

	let { ast }: Props = $props();

	let variables = $derived.by(() => {
		const variables = new Set<string>();

		dfs(ast, (node) => {
			if (isLiteral(node)) {
				variables.add(node.constant);
			}
		});

		return [...variables].sort();
	});

	let rows = $derived.by(() =>
		createCombinations(variables, [true, false]).map((model) => {
			return {
				columns: variables.map((variable) => model.get(variable) ?? false),
				result: evaluate(ast, model),
			};
		}),
	);
</script>

<div class="p-8">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b border-neutral-300">
				{#each variables as variable}
					<th>{variable}</th>
				{/each}
				<th class="px-3 py-2 text-center font-semibold text-primary border-l border-neutral-300"
					>Wynik</th
				>
			</tr>
		</thead>
		<tbody>
			{#each rows as { columns, result }}
				<tr class="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
					{#each columns as column}
						<td class="px-3 py-2 text-center">
							<span class={column ? 'text-success-800' : 'text-neutral-700'}>
								{Number(column)}
							</span>
						</td>
					{/each}
					<td class="px-3 py-2 text-center border-l border-neutral-300">
						<span
							class={[
								'inline-flex items-center justify-center w-6 h-6 rounded-md font-bold',
								result ? 'bg-success-100 text-success-900' : 'bg-error-100 text-error-900',
							]}
						>
							{Number(result)}
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
