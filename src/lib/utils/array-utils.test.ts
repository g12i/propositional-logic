import { describe, expect, it } from 'vitest';
import { createCombinations } from './array-utils.js';

describe(createCombinations.name, () => {
	it('should work for boolean values', () => {
		const result = createCombinations(['p', 'q'], [true, false]);

		expect(result).toEqual([
			new Map([
				['p', true],
				['q', true]
			]),
			new Map([
				['p', false],
				['q', true]
			]),
			new Map([
				['p', true],
				['q', false]
			]),
			new Map([
				['p', false],
				['q', false]
			])
		]);
	});

	it('should create combinations for mixed types', () => {
		const result = createCombinations(['a', 'b', 'c'], [1, 2, 3, 4]);

		expect(result).toMatchSnapshot();
		expect(result).toHaveLength(4 ** 3);
	});
});
