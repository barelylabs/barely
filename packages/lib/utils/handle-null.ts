type RecursivelyReplaceNullWithUndefined<T> = T extends null
	? undefined
	: T extends Date
		? T
		: {
				[K in keyof T]: T[K] extends (infer U)[]
					? RecursivelyReplaceNullWithUndefined<U>[]
					: RecursivelyReplaceNullWithUndefined<T[K]>;
			};

export function nullsToUndefined<T>(obj: T): RecursivelyReplaceNullWithUndefined<T> {
	if (obj === null) {
		return undefined as RecursivelyReplaceNullWithUndefined<T>;
	}

	// object check based on: https://stackoverflow.com/a/51458052/6489012
	if (obj?.constructor.name === 'Object') {
		for (const key in obj) {
			(obj as Record<string, unknown>)[key] = nullsToUndefined(
				(obj as Record<string, unknown>)[key],
			);
		}
	}
	return obj as RecursivelyReplaceNullWithUndefined<T>;
}
