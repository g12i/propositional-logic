import { describe, expect, it } from "vitest";
import { buildHierarchy } from "../src/hierarchy.js";
import { normalizeAndSplitChars } from "../src/utils/text-utils.js";
import { parse } from "../src/ast.js";
import { stringify } from "../src/utils/ast-utils.js";

const sentence = " ~ (p  ~ q) → (~ p  q))";
const chars = normalizeAndSplitChars(sentence);
const root = buildHierarchy(chars);
const parsed = parse(root);

describe(parse.name, () => {
  it("should parse", () => {
    expect(parsed).toMatchSnapshot();
  });
});

describe(stringify.name, () => {
  it("should stringify", () => {
    expect(stringify(parsed)).toMatchInlineSnapshot(`"(~(p ∨ ~q) → (~p ∨ q))"`);
  });
});
