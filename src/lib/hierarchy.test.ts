import { describe, expect, it } from 'vitest';
import { buildHierarchy } from './hierarchy.js';
import { normalizeAndSplitChars } from './utils/text-utils.js';

describe(buildHierarchy.name, () => {
	it('should build hierarchy', () => {
		const sentence = ' ~ (p  ~ q) → (~ p  q))';
		const chars = normalizeAndSplitChars(sentence);
		const root = buildHierarchy(chars);

		expect(root.toString()).toMatchInlineSnapshot(
			`"root#(~#(node#(p ∨ ~#(node#(q)))) → node#(~#(node#(p)) ∨ q))"`,
		);
	});
});
