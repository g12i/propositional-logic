import { type Node } from './ast.js';
import { AND, EQ, IMPL, OR } from './constants.js';
import { createCombinations } from './utils/array-utils.js';
import { dfs, isBinary, isLiteral, isUnary } from './utils/ast-utils.js';

type Model = Map<string, boolean>;

export function evaluate(node: Node, model: Model): boolean {
	if (isLiteral(node)) {
		return model.get(node.constant) ?? false;
	}

	if (isUnary(node)) {
		return !evaluate(node.node, model);
	}

	if (isBinary(node)) {
		const leftValue = evaluate(node.left, model);
		const rightValue = evaluate(node.right, model);

		switch (node.__type) {
			case AND:
				return leftValue && rightValue;
			case OR:
				return leftValue || rightValue;
			case IMPL:
				// (A -> B) is equivalent to (!A || B)
				return !leftValue || rightValue;
			case EQ:
				return leftValue === rightValue;
			default:
				throw new Error(`Unknown binary operator: ${(node as { __type: string }).__type}`);
		}
	}

	throw new Error(`Unknown node type: ${(node as { __type: string }).__type}`);
}

export function isTautology(ast: Node): boolean {
	const literalConstants = new Set<string>();

	dfs(ast, (node) => {
		if (isLiteral(node)) {
			literalConstants.add(node.constant);
		}
	});

	const combinations = createCombinations([...literalConstants], [true, false]);

	for (const model of combinations) {
		if (!evaluate(ast, model)) {
			return false;
		}
	}

	return true;
}

export function isContradiction(ast: Node): boolean {
	const literalConstants = new Set<string>();

	dfs(ast, (node) => {
		if (isLiteral(node)) {
			literalConstants.add(node.constant);
		}
	});

	const combinations = createCombinations([...literalConstants], [true, false]);

	for (const model of combinations) {
		if (evaluate(ast, model)) {
			return false;
		}
	}

	return true;
}
