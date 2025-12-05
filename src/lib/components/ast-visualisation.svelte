<script lang="ts">
	import dagre from '@dagrejs/dagre';
	import {
		SvelteFlow,
		Background,
		Position,
		ConnectionLineType,
		type Node as FlowNode,
		type Edge as FlowEdge
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import type { Node } from '../ast.js';
	import { isBinary, isUnary, isLiteral } from '../utils/ast-utils.js';
	import { AND, OR, IMPL, EQ, NOT } from '../constants.js';

	let { ast = null }: { ast?: Node | Error | null } = $props();

	// Convert AST to Svelte Flow nodes and edges
	function astToFlowNodes(node: Node): { nodes: FlowNode[]; edges: FlowEdge[] } {
		const nodes: FlowNode[] = [];
		const edges: FlowEdge[] = [];
		let nodeIdCounter = 0;

		function traverse(currentNode: Node, parentId: string | null = null): string {
			const id = `node-${nodeIdCounter++}`;
			let label = '';
			let color = '';

			if (isLiteral(currentNode)) {
				label = currentNode.constant;
				color = '#e0e7ff'; // Light indigo for literals
			} else if (isUnary(currentNode)) {
				label = `NIE (${NOT})`;
				color = '#fef3c7'; // Light yellow for negation
			} else if (isBinary(currentNode)) {
				if (currentNode.__type === AND) {
					label = `I (${AND})`;
					color = '#dbeafe'; // Light blue
				} else if (currentNode.__type === OR) {
					label = `LUB (${OR})`;
					color = '#d1fae5'; // Light green
				} else if (currentNode.__type === IMPL) {
					label = `IMPLIKUJE (${IMPL})`;
					color = '#fce7f3'; // Light pink
				} else if (currentNode.__type === EQ) {
					label = `RÓWNOWAŻNE (${EQ})`;
					color = '#e9d5ff'; // Light purple
				}
			}

			const styleString = [
				`background: ${color}`,
				'border: 2px solid #4b5563',
				'border-radius: 8px',
				'font-size: 14px',
				'font-weight: 600',
				'padding: 12px 16px',
				'min-width: 100px',
				'text-align: center'
			].join('; ');

			nodes.push({
				id,
				type: 'default',
				position: { x: 0, y: 0 }, // Will be set by Dagre
				data: { label },
				style: styleString,
				draggable: false,
				selectable: false
			});

			if (parentId) {
				// Reverse edge direction: child -> parent (so constants feed into operators)
				edges.push({
					id: `edge-${id}-${parentId}`,
					source: id,
					target: parentId,
					type: 'smoothstep',
					animated: true
				});
			}

			// Traverse children
			if (isBinary(currentNode)) {
				traverse(currentNode.left, id);
				traverse(currentNode.right, id);
			} else if (isUnary(currentNode)) {
				traverse(currentNode.node, id);
			}

			return id;
		}

		traverse(node);
		return { nodes, edges };
	}

	// Apply Dagre layout
	function applyLayout(nodes: FlowNode[], edges: FlowEdge[]): { nodes: FlowNode[]; edges: FlowEdge[] } {
		if (nodes.length === 0) {
			return { nodes, edges };
		}

		const dagreGraph = new dagre.graphlib.Graph();
		dagreGraph.setDefaultEdgeLabel(() => ({}));
		dagreGraph.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });

		const nodeWidth = 150;
		const nodeHeight = 50;

		nodes.forEach((node) => {
			dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
		});

		edges.forEach((edge) => {
			dagreGraph.setEdge(edge.source, edge.target);
		});

		dagre.layout(dagreGraph);

		const layoutedNodes = nodes.map((node) => {
			const nodeWithPosition = dagreGraph.node(node.id);
			node.targetPosition = Position.Left;
			node.sourcePosition = Position.Right;

			return {
				...node,
				position: {
					x: nodeWithPosition.x - nodeWidth / 2,
					y: nodeWithPosition.y - nodeHeight / 2
				}
			};
		});

		return { nodes: layoutedNodes, edges };
	}

	// Derived state for flow nodes and edges
	let flowData = $derived.by(() => {
		if (!ast || ast instanceof Error) {
			return { nodes: [], edges: [] };
		}
		const { nodes, edges } = astToFlowNodes(ast);
		return applyLayout(nodes, edges);
	});

	let nodes = $state.raw<FlowNode[]>([]);
	let edges = $state.raw<FlowEdge[]>([]);

	// Update nodes and edges when flowData changes
	$effect(() => {
		nodes = flowData.nodes;
		edges = flowData.edges;
	});
</script>

<div class="w-full h-full">
	{#if nodes.length > 0}
		<SvelteFlow
			bind:nodes
			bind:edges
			fitView
			connectionLineType={ConnectionLineType.SmoothStep}
			defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
			nodesDraggable={false}
			nodesConnectable={false}
			elementsSelectable={false}
			selectNodesOnDrag={false}
		>
			<Background />
		</SvelteFlow>
	{:else}
		<div class="flex items-center justify-center h-full text-gray-400">
			{#if ast instanceof Error}
				<div class="text-center">
					<div class="text-red-600 mb-2">❌ Błąd parsowania</div>
					<div class="text-sm">{ast.message}</div>
				</div>
			{:else}
				Wprowadź poprawne wyrażenie, aby zobaczyć wizualizację
			{/if}
		</div>
	{/if}
</div>

