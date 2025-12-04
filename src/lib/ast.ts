import { AND, EQ, IMPL, NOT, OR } from './constants.js';
import { HierarchicalTree } from './hierarchy.js';

export type Literal = {
	__type: 'literal';
	constant: string;
};

export type UnaryOperator = {
	__type: typeof NOT;
	node: Node;
};

export type BinaryOperator = {
	__type: typeof IMPL | typeof OR | typeof AND | typeof EQ;
	left: Node;
	right: Node;
};

export type Node = UnaryOperator | BinaryOperator | Literal;

const not = (node: Node): UnaryOperator => ({ __type: NOT, node });
const lit = (constant: string): Literal => ({ __type: 'literal', constant });
const bin = (operator: BinaryOperator['__type'], left: Node, right: Node): BinaryOperator => ({
	__type: operator,
	left,
	right,
});

const toTree = <T>(node: T | HierarchicalTree<T>): HierarchicalTree<T> => {
	if (node instanceof HierarchicalTree) {
		return node;
	}

	return new HierarchicalTree<T>('tmp', [node]);
};

export function parse(node: HierarchicalTree<string>): Node {
	if (node.type === NOT) {
		if (node.items.length !== 1) {
			throw new Error('Invalid Tree. Seems like NOT were not normalized.');
		}

		if (!node.items[0] || !(node.items[0] instanceof HierarchicalTree)) {
			throw new Error('Invalid Tree. Seems like NOT were not normalized.');
		}

		return not(parse(node.items[0]));
	}

	// Base case: single literal string
	if (node.length === 1 && typeof node.items[0] === 'string') {
		return lit(node.items[0]);
	}

	// If we have a nested single node, unwrap it
	if (node.length === 1 && node.items[0] instanceof HierarchicalTree) {
		return parse(node.items[0] as HierarchicalTree<string>);
	}

	if (node.length === 3) {
		const [left, operator, right] = node.items;

		if (operator !== IMPL && operator !== OR && operator !== AND && operator !== EQ) {
			throw new Error(`Invalid operator: ${operator}`);
		}

		if (!left || !right) {
			throw new Error('Invalid Tree. Expected left and right nodes.');
		}

		return bin(operator, parse(toTree(left)), parse(toTree(right)));
	}

	throw new Error(`Unable to parse node: ${JSON.stringify(node)}`);
}
