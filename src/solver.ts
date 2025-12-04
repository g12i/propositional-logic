import { type Node, parse, walk } from "./ast.js";
import { AND, EQ, IMPL, NOT, OR } from "./constants.js";
import { buildHierarchy } from "./hierarchy.js";

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
  switch (node.type) {
    case "literal":
      // Literals that are not in the model are considered false.
      return model.get(node.constant) ?? false;
    case NOT:
      return !evaluate(node.node, model);
    case AND:
      return evaluate(node.left, model) && evaluate(node.right, model);
    case OR:
      return evaluate(node.left, model) || evaluate(node.right, model);
    case IMPL:
      // (A -> B) is equivalent to (!A || B)
      return !evaluate(node.left, model) || evaluate(node.right, model);
    case EQ:
      // (A <-> B) is true if both sides have the same truth value.
      return evaluate(node.left, model) === evaluate(node.right, model);
  }
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
  walk(ast, (node) => {
    if (node.type === "literal") {
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
        model.set(literal, true);
      } else {
        model.set(literal, false);
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
