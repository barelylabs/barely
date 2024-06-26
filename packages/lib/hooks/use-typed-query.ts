import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { z } from 'zod';
import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type OptionalKeys<T> = {
	[K in keyof T]-?: Record<string, unknown> extends Pick<T, K> ? K : never;
}[keyof T];

type FilteredKeys<T, U> = {
	[K in keyof T as T[K] extends U ? K : never]: T[K];
};

// Take array as a string and return zod array
// export const queryNumberArraySchema = z
// 	.string()
// 	.or(z.number())
// 	.or(z.array(z.number()))
// 	.transform(a => {
// 		if (typeof a === 'string') return a.split(',').map(a => Number(a));
// 		if (Array.isArray(a)) return a;
// 		return [a];
// 	});

// Take array as a string and return zod string array
// export const queryStringArraySchema = z
// 	.string()
// 	.or(z.array(z.string()))
// 	.transform(a => {
// 		if (typeof a === 'string') return a.split(',');
// 		if (Array.isArray(a)) return a;
// 		return [a];
// 	});

// Take string and return zod string array - comma separated
// export const queryStringArray = z
//   .preprocess((a) => z.string().parse(a).split(","), z.string().array())
//   .or(z.string().array());

export function useTypedQuery<T extends z.AnyZodObject>(
	schema: T,
	options?: {
		replace?: boolean;
	},
) {
	type Output = z.infer<typeof schema>;
	type FullOutput = Required<Output>;
	type OutputKeys = Required<keyof FullOutput>;
	type OutputOptionalKeys = OptionalKeys<Output>;
	type ArrayOutput = FilteredKeys<FullOutput, unknown[]>;
	type ArrayOutputKeys = keyof ArrayOutput;

	const router = useRouter();
	const pathname = usePathname() as null | string;
	const unparsedQuery = useSearchParams() as null | ReadonlyURLSearchParams;

	const parsedQuerySchema =
		unparsedQuery ?
			schema.safeParse(Object.fromEntries(unparsedQuery))
		:	schema.safeParse({});

	let parsedQuery: Output = useMemo(() => {
		return {} as Output;
	}, []);

	if (parsedQuerySchema.success) parsedQuery = parsedQuerySchema.data;
	else if (!parsedQuerySchema.success) console.error(parsedQuerySchema.error);

	const setPath = useCallback(
		function setPath(path: string) {
			if (options?.replace) {
				router.replace(path, {
					scroll: false,
				});
			} else {
				return router.push(path, {
					scroll: false,
				});
			}
		},
		[router],
	);

	// Set the query based on schema values
	const getSetQueryPath = useCallback(
		function getSetQueryPath<J extends OutputKeys>(key: J, value: Output[J]) {
			// Remove old value by key so we can merge new value
			const { [key]: _, ...newQuery } = parsedQuery;
			const newValue = { ...newQuery, [key]: value };
			const queryString = new URLSearchParams(newValue).toString();
			const newPath = `${pathname}${queryString.length > 0 ? `?${queryString}` : ''}`;
			return newPath;
		},
		[parsedQuery, pathname],
	);

	const setQuery = useCallback(
		function setQuery<J extends OutputKeys>(key: J, value: Output[J]) {
			const newPath = getSetQueryPath(key, value);

			setPath(newPath);
		},
		[getSetQueryPath, setPath],
	);

	// Delete a key from the query
	const getRemoveByKeyPath = useCallback(
		function getRemoveByKeyPath<J extends OutputOptionalKeys>(key: J) {
			const { [key]: _, ...newQuery } = parsedQuery;
			const queryString = new URLSearchParams(newQuery).toString();
			const newPath = `${pathname}${queryString.length > 0 ? `?${queryString}` : ''}`;
			return newPath;
		},
		[parsedQuery, pathname],
	);

	function removeByKey(key: OutputOptionalKeys) {
		const newPath = getRemoveByKeyPath(key);
		setPath(newPath);
	}

	// push item to existing key
	function pushItemToKey<J extends ArrayOutputKeys>(
		key: J,
		value: ArrayOutput[J][number],
	) {
		const existingValue = parsedQuery[key];
		if (Array.isArray(existingValue)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			if (existingValue.includes(value)) return; // prevent adding the same value to the array
			// @ts-expect-error this is too much for TS it seems
			setQuery(key, [...existingValue, value]);
		} else {
			// @ts-expect-error this is too much for TS it seems
			setQuery(key, [value]);
		}
	}

	// Remove item by key and value
	function removeItemByKeyAndValue<J extends ArrayOutputKeys>(
		key: J,
		value: ArrayOutput[J][number],
	) {
		const existingValue = parsedQuery[key];
		if (Array.isArray(existingValue) && existingValue.length > 1) {
			// @ts-expect-error this is too much for TS it seems
			// eslint-disable-next-line
			const newValue = existingValue.filter(item => item !== value);
			// eslint-disable-next-line
			setQuery(key, newValue);
		} else {
			// @ts-expect-error this is too much for TS it seems
			removeByKey(key);
		}
	}

	// Remove all query params from the URL
	function removeAllQueryParams() {
		if (!pathname) return;
		router.replace(pathname);
	}

	return {
		data: parsedQuery,
		getSetQueryPath,
		setQuery,
		getRemoveByKeyPath,
		removeByKey,
		pushItemToKey,
		removeItemByKeyAndValue,
		removeAllQueryParams,
	};
}
