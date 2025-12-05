<script lang="ts">
	import {
		Background,
		BackgroundVariant,
		ConnectionLineType,
		SvelteFlow,
		type Edge as FlowEdge,
		type Node as FlowNode,
	} from '@xyflow/svelte';
	import { stratify, tree } from 'd3-hierarchy';
	import type { Node } from '../ast.js';
	import { AND, EQ, IMPL, NOT, OR } from '../constants.js';
	import { bfs, dfs, isBinary, isLiteral, isUnary } from '../utils/ast-utils.js';

	type Props = {
		ast: Node;
	};

	let { ast }: Props = $props();

	const nodeWidth = 120;
	const nodeHeight = 50;
	const g = tree<FlowNode>();

	const applyLayout = ({
		nodes,
		edges,
	}: {
		nodes: FlowNode[];
		edges: FlowEdge[];
	}): { nodes: FlowNode[]; edges: FlowEdge[] } => {
		if (nodes.length === 0) {
			return { nodes: [], edges };
		}

		const root = stratify<FlowNode>()
			.id((node) => node.id)
			.parentId((node) => edges.find((edge) => edge.target === node.id)?.source)(nodes);

		const layout = g.nodeSize([nodeWidth * 2, nodeHeight * 2])(root);

		return {
			nodes: layout
				.descendants()
				.map((node) => ({ ...node.data, position: { x: node.x, y: node.y } })),
			edges,
		};
	};

	const astNodeToFlowNode = (node: Node, id: string): FlowNode => {
		let label = '';
		let className = '';

		if (isLiteral(node)) {
			label = node.constant;
			className = 'bg-indigo-100!';
		} else if (isUnary(node)) {
			label = `NIE (${NOT})`;
			className = 'bg-yellow-100!';
		} else if (isBinary(node)) {
			if (node.__type === AND) {
				label = `I (${AND})`;
				className = 'bg-blue-100!';
			} else if (node.__type === OR) {
				label = `LUB (${OR})`;
				className = 'bg-green-100!';
			} else if (node.__type === IMPL) {
				label = `IMPLIKUJE (${IMPL})`;
				className = 'bg-pink-100!';
			} else if (node.__type === EQ) {
				label = `RÓWNOWAŻNE (${EQ})`;
				className = 'bg-purple-100!';
			}
		}

		return {
			id,
			type: 'default',
			position: { x: 0, y: 0 },
			data: { label },
			draggable: false,
			selectable: false,
			class: `rounded-md! ${className}`,
		};
	};

	const astToFlowNodes = (
		root: Node,
	): {
		nodes: FlowNode[];
		edges: FlowEdge[];
	} => {
		const nodeMap = new Map<Node, string>();
		const edges: FlowEdge[] = [];

		let nodeIdCounter = 0;

		dfs(root, (currentNode) => {
			if (!nodeMap.has(currentNode)) {
				nodeMap.set(currentNode, `node-${nodeIdCounter++}`);
			}
		});

		const nodes: FlowNode[] = [];

		bfs(root, (node, parent) => {
			const parentId = parent ? nodeMap.get(parent) : undefined;
			const nodeId = nodeMap.get(node);

			if (nodeId) {
				nodes.push(astNodeToFlowNode(node, nodeId));
				if (parentId) {
					edges.push({
						id: `${parentId}-${nodeId}`,
						source: parentId,
						target: nodeId,
						animated: false,
						style: `stroke: var(--color-neutral-500);`,
					});
				}
			}
		});

		return applyLayout({ nodes, edges });
	};

	// Derived state for flow nodes and edges
	let flowData = $derived.by(() => astToFlowNodes(ast));
</script>

<div class="w-full h-full">
	{#if flowData.nodes.length > 0}
		<SvelteFlow
			nodes={flowData.nodes}
			edges={flowData.edges}
			fitView
			connectionLineType={ConnectionLineType.SmoothStep}
			defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
			nodesDraggable={false}
			nodesConnectable={false}
			elementsSelectable={false}
			selectNodesOnDrag={false}
		>
			<Background patternColor="var(--color-neutral-300)" variant={BackgroundVariant.Dots} />
		</SvelteFlow>
	{/if}
</div>
