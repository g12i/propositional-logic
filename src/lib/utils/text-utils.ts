import { AND, EQ, IMPL, NOT, OR } from '../constants.js';

const replacementMap = new Map(
	Object.entries({
		'': AND,
		'': OR,
		'→': IMPL,
		'': EQ,
		'~': NOT,
		'>': IMPL,
		'|': OR,
		'&': AND,
	}),
);

export function normalizeAndSplitChars(sentence: string): string[] {
	return sentence
		.toLowerCase()
		.replace(/\s*/g, '')
		.split('')
		.map((char) => replacementMap.get(char) ?? char);
}
