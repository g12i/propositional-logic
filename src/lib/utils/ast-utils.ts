import { Queue } from 'queue-typescript';
import { Stack } from 'stack-typescript';
import type { BinaryOperator, Literal, Node, UnaryOperator } from '../ast.js';
import { AND, EQ, IMPL, NOT, OR } from '../constants.js';

export const isBinary = (node: Node): node is BinaryOperator => {
	return node.__type === IMPL || node.__type === OR || node.__type === AND || node.__type === EQ;
};

export const isUnary = (node: Node): node is UnaryOperator => {
	return node.__type === NOT;
};

export const isLiteral = (node: Node): node is Literal => {
	return node.__type === 'literal';
};

export function dfs(node: Node, callback: (node: Node, parent: Node | undefined) => void) {
	const stack = new Stack<{ node: Node; parent: Node | undefined }>({ node, parent: undefined });
	const visited = new Set();

	while (stack.length) {
		const { node: current, parent } = stack.pop();

		if (!visited.has(current)) {
			visited.add(current);

			if (isUnary(current)) {
				stack.push({ node: current.node, parent: current });
			} else if (isBinary(current)) {
				stack.push({ node: current.left, parent: current });
				stack.push({ node: current.right, parent: current });
			}

			callback(current, parent);
		}
	}
}

export function bfs(node: Node, callback: (node: Node, parent: Node | undefined) => void) {
	const queue = new Queue<{ node: Node; parent: Node | undefined }>({ node, parent: undefined });
	const visited = new Set();

	while (queue.length) {
		const { node: current, parent } = queue.dequeue();

		if (!visited.has(current)) {
			visited.add(current);

			if (isUnary(current)) {
				queue.enqueue({ node: current.node, parent: current });
			} else if (isBinary(current)) {
				queue.enqueue({ node: current.left, parent: current });
				queue.enqueue({ node: current.right, parent: current });
			}

			callback(current, parent);
		}
	}
}

export function stringify(node: Node): string {
	if (isUnary(node)) {
		return `${NOT}${stringify(node.node)}`;
	}

	if (isBinary(node)) {
		return `(${stringify(node.left)} ${node.__type} ${stringify(node.right)})`;
	}

	if (isLiteral(node)) {
		return node.constant;
	}

	throw new Error(`Unknown node type: ${(node as { __type: string }).__type}`);
}
