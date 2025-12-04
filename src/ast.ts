import { splitArray } from "./utils/array-utils.js";
import { AND, EQ, IMPL, NOT, OR } from "./constants.js";
import { HierarchicalTree } from "./hierarchy.js";

type Literal = {
  type: "literal";
  constant: string;
};

type UnaryOperator = {
  type: typeof NOT;
  node: Node;
};

type BinaryOperator = {
  type: typeof IMPL | typeof OR | typeof AND | typeof EQ;
  left: Node;
  right: Node;
};

export type Node = UnaryOperator | BinaryOperator | Literal;

export function parse(node: HierarchicalTree<string>): Node {
  // Handle binary operators first (higher precedence at top level)
  const operators = [IMPL, OR, AND, EQ];

  for (const op of operators) {
    const opIndex = node.items.indexOf(op);
    if (opIndex !== -1) {
      const left = node.items.slice(0, opIndex);
      const right = node.items.slice(opIndex + 1);

      if (left.length > 0 && right.length > 0) {
        const parseItem = (items: (string | HierarchicalTree<string>)[]) => {
          if (items.length === 1) {
            const item = items[0];
            return typeof item === "string"
              ? { type: "literal", constant: item }
              : parse(item as HierarchicalTree<string>);
          }
          return parse(new HierarchicalTree(items));
        };

        return {
          type: op,
          left: parseItem(left),
          right: parseItem(right),
        } as BinaryOperator;
      }
    }
  }

  // Handle NOT operator (after binary operators)
  if (node.items.includes(NOT)) {
    const parts = splitArray(node.items, NOT);

    // Count leading NOTs and find the content
    let notCount = 0;
    let contentPartIndex = 0;

    for (let i = 0; i < parts.length; i++) {
      if (parts[i]?.length === 0) {
        notCount++;
      } else {
        contentPartIndex = i;
        break;
      }
    }

    const contentPart = parts[contentPartIndex];
    if (contentPart && contentPart.length === 0) {
      throw new Error("Invalid syntax: NOT operator without operand");
    }

    // Parse the content
    let result = parse(new HierarchicalTree(contentPart));

    // Wrap in NOT operators from innermost to outermost
    for (let i = 0; i < notCount; i++) {
      result = {
        type: NOT,
        node: result,
      } as UnaryOperator;
    }

    return result;
  }

  // Base case: single literal string
  if (node.length === 1 && typeof node.items[0] === "string") {
    return { type: "literal", constant: node.items[0] };
  }

  // If we have a nested single node, unwrap it
  if (node.length === 1 && node.items[0] instanceof HierarchicalTree) {
    return parse(node.items[0] as HierarchicalTree<string>);
  }

  throw new Error(`Unable to parse node: ${JSON.stringify(node)}`);
}

export function stringify(node: Node): string {
  switch (node.type) {
    case "literal":
      return node.constant;
    case NOT:
      return `${NOT}${stringify(node.node)}`;
    case IMPL:
    case OR:
    case AND:
    case EQ:
      return `(${stringify(node.left)} ${node.type} ${stringify(node.right)})`;
    default:
      throw new Error(`Unknown node type: ${(node as any).type}`);
  }
}

export function walk(node: Node, fn: (node: Node) => void) {
  if (node.type === NOT) {
    walk(node.node, fn);
  } else if (
    node.type === IMPL ||
    node.type === OR ||
    node.type === AND ||
    node.type === EQ
  ) {
    walk(node.left, fn);
    walk(node.right, fn);
  }

  fn(node);
}

export function bfs(node: Node, fn: (node: Node) => void) {
  const queue = [node];
  const visited = new Set<Node>();

  while (queue.length) {
    const next = queue.shift();

    if (next && !visited.has(next)) {
      visited.add(next);
      fn(next);

      if (next.type === NOT) {
        queue.push(next.node);
      } else if (
        next.type === IMPL ||
        next.type === OR ||
        next.type === AND ||
        next.type === EQ
      ) {
        queue.push(next.left);
        queue.push(next.right);
      }
    }
  }
}
