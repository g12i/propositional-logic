export function createCombinations<T1, T2>(array1: T1[], array2: T2[]): Map<T1, T2>[] {
	const combinations: Map<T1, T2>[] = [];
	const totalCombinations = array2.length ** array1.length;

	for (let i = 0; i < totalCombinations; i++) {
		const map = new Map<T1, T2>();
		let temp = i;

		for (const key of array1) {
			const valueIndex = temp % array2.length;
			const value = array2[valueIndex];

			if (value !== undefined) {
				map.set(key, value);
			}

			temp = Math.floor(temp / array2.length);
		}

		combinations.push(map);
	}

	return combinations;
}
