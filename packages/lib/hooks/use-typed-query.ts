'use client';

// import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { z } from 'zod';
import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useRouterQuery } from './use-router-query';

type OptionalKeys<T> = {
	[K in keyof T]-?: Record<string, unknown> extends Pick<T, K> ? K : never;
}[keyof T];

type FilteredKeys<T, U> = {
	[K in keyof T as T[K] extends U ? K : never]: T[K];
};

export function useTypedQuery<T extends z.AnyZodObject>(schema: T) {
	type Output = z.infer<typeof schema>;
	type FullOutput = Required<Output>;
	type OutputKeys = Required<keyof FullOutput>;
	type OutputOptionalKeys = OptionalKeys<Output>;
	type ArrayOutput = FilteredKeys<FullOutput, unknown[]>;
	type ArrayOutputKeys = keyof ArrayOutput;

	const router = useRouter();
	const unparsedQuery = useRouterQuery();
	const pathname = usePathname();

	const parsedQuerySchema =
		unparsedQuery ? schema.safeParse(unparsedQuery) : schema.safeParse({});

	let parsedQuery: Output = useMemo(() => {
		return {} as Output;
	}, []);

	useEffect(() => {
		if (parsedQuerySchema.success && parsedQuerySchema.data && unparsedQuery) {
			Object.entries(parsedQuerySchema.data).forEach(([key, value]) => {
				if (key in unparsedQuery || !value) return;
				const search = new URLSearchParams(parsedQuery);
				search.set(String(key), String(value));
				router.replace(`${pathname}?${search.toString()}`);
			});
		}
	}, [parsedQuerySchema, schema, router, pathname, unparsedQuery, parsedQuery]);

	if (parsedQuerySchema.success) parsedQuery = parsedQuerySchema.data;
	else if (!parsedQuerySchema.success) console.error(parsedQuerySchema.error);

	const setQuery = useCallback(
		function setQuery<J extends OutputKeys>(key: J, value: Output[J]) {
			// Remove old value by key so we can merge new value
			const search = new URLSearchParams(parsedQuery);
			search.set(String(key), String(value));
			router.replace(`${pathname}?${search.toString()}`);
		},

		[parsedQuery, router],
	);

	function removeByKey(key: OutputOptionalKeys) {
		const search = new URLSearchParams(parsedQuery);
		search.delete(String(key));
		router.replace(`${pathname}?${search.toString()}`);
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
		setQuery,
		removeByKey,
		pushItemToKey,
		removeItemByKeyAndValue,
		removeAllQueryParams,
	};
}
