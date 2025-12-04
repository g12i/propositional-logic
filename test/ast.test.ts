import { describe, expect, it } from "vitest";
import { buildHierarchy } from "../src/hierarchy.js";
import { normalizeAndSplitChars } from "../src/utils/text-utils.js";
import { parse, stringify } from "../src/ast.js";

describe("ast", () => {
  it("should parse", () => {
    const sentence = " ~ (p  ~ q) → (~ p  q))";
    const chars = normalizeAndSplitChars(sentence);
    const root = buildHierarchy(chars);
    const parsed = parse(root);

    expect(parsed).toMatchSnapshot();
    expect(stringify(parsed)).toMatchInlineSnapshot(`"(~(p ∨ ~q) → (~p ∨ q))"`);
  });
});
