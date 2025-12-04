import { parse, stringify } from "./ast.js";
import { buildHierarchy } from "./hierarchy.js";
import { isTautology } from "./solver.js";
import { normalizeSentence as normalizeAndSplitChars } from "./utils/text-utils.js";

function solve(sentence: string) {
  const chars = normalizeAndSplitChars(sentence);
  const root = buildHierarchy(chars);

  const parsed = parse(root);

  const is = isTautology(parsed);

  console.log(stringify(parsed), is ? "IS a tautology" : "is NOT a tautology");
}

solve(" ~ (p  ~ q) → (~ p  q))");
