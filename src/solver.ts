import { type Node } from "./ast.js";
import { AND, EQ, IMPL, NOT, OR } from "./constants.js";
import { bfs, isBinary, isLiteral, isUnary } from "./utils/ast-utils.js";

/**
 * A model represents a possible truth assignment for the literals in a sentence.
 * It's a map from the literal's name (string) to its assigned truth value (boolean).
 */
type Model = Map<string, boolean>;

/**
 * Evaluates the truth value of an AST node for a given model.
 * @param node The AST node to evaluate.
 * @param model The truth assignments for the literals.
 * @returns The boolean result of the evaluation.
 */
function evaluate(node: Node, model: Model): boolean {
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
        throw new Error(`Unknown binary operator: ${(node as any).__type}`);
    }
  }

  throw new Error(`Unknown node type: ${(node as any).__type}`);
}

/**
 * Checks if a given logical sentence is a tautology.
 * A tautology is a sentence that is true for all possible truth assignments.
 * @param sentence The logical sentence as a string array.
 * @returns `true` if the sentence is a tautology, `false` otherwise.
 */
export function isTautology(ast: Node): boolean {
  // 1. Find all unique literals in the AST.
  const literals = new Set<string>();
  bfs(ast, (node) => {
    if (isLiteral(node)) {
      literals.add(node.constant);
    }
  });

  const uniqueLiterals = Array.from(literals);
  const literalCount = uniqueLiterals.length;

  // 2. Iterate through all 2^n possible models (truth assignments).
  for (let i = 0; i < 1 << literalCount; i++) {
    const model: Model = new Map();

    // 3. Create a model for the current combination.
    for (let j = 0; j < literalCount; j++) {
      // Use bitwise operations to assign true/false for each literal.
      const literal = uniqueLiterals[j];
      if ((i >> j) & 1) {
        model.set(literal!, true);
      } else {
        model.set(literal!, false);
      }
    }

    // 4. If the expression evaluates to false for any model, it's not a tautology.
    if (!evaluate(ast, model)) {
      return false;
    }
  }

  // 5. If we get here, it was true for all models.
  return true;
}
