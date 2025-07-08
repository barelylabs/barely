'use client';

import type * as z from 'zod/v4';
import { useCallback, useEffect, useOptimistic, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useRouterQuery } from './use-router-query';

type OptionalKeys<T> = {
	[K in keyof T]-?: Record<string, unknown> extends Pick<T, K> ? K : never;
}[keyof T];

type FilteredKeys<T, U> = {
	[K in keyof T as T[K] extends U ? K : never]: T[K];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTypedOptimisticQuery<T extends z.ZodObject<any, any>>(
	schema: T,
	{ replaceOnChange = false }: { replaceOnChange?: boolean } = {},
) {
	type Output = z.infer<typeof schema>;
	type FullOutput = Required<Output>;
	type OutputKeys = Required<keyof FullOutput>;
	type OutputOptionalKeys = OptionalKeys<Output>;
	type ArrayOutput = FilteredKeys<FullOutput, unknown[]>;
	type ArrayOutputKeys = keyof ArrayOutput;
	type ArrayOutputValue<J extends ArrayOutputKeys> =
		ArrayOutput[J] extends (infer U)[] ? U : never;

	const router = useRouter();
	const unparsedQuery = useRouterQuery();
	const pathname = usePathname();

	const [pendingTransition, startTransition] = useTransition();

	const toSearchParams = (query: Output): URLSearchParams => {
		const search = new URLSearchParams();
		Object.entries(query).forEach(([key, value]) => {
			if (value != null) {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				search.set(key, String(value));
			}
		});
		return search;
	};

	const parsedQuerySchema = schema.safeParse(unparsedQuery);

	const initialParsedQuery: Output =
		parsedQuerySchema.success ? parsedQuerySchema.data : ({} as Output);

	const [optimisticParsedQuery, setOptimisticParsedQuery] =
		useOptimistic<Output>(initialParsedQuery);

	useEffect(() => {
		if (parsedQuerySchema.success) {
			Object.entries(parsedQuerySchema.data).forEach(([key, value]) => {
				if (key in unparsedQuery || !value) return;
				// const search = new URLSearchParams(optimisticParsedQuery);
				const search = toSearchParams(optimisticParsedQuery);
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				search.set(String(key), String(value));
				if (replaceOnChange) {
					router.replace(`${pathname}?${search.toString()}`, { scroll: false });
				} else {
					router.push(`${pathname}?${search.toString()}`, { scroll: false });
				}
			});
		}
	}, [parsedQuerySchema, schema, router, pathname, unparsedQuery, optimisticParsedQuery]);

	const getSetQueryPath = useCallback(
		function getSetQueryPath<J extends OutputKeys>(key: J, value: Output[J]) {
			// const search = new URLSearchParams(optimisticParsedQuery);
			const search = toSearchParams(optimisticParsedQuery);
			search.set(String(key), String(value));
			return `${pathname}?${search.toString()}`;
		},
		[optimisticParsedQuery, pathname, router],
	);

	const setQuery = useCallback(
		function setQuery<J extends OutputKeys>(key: J, value: Output[J]) {
			// Remove old value by key so we can merge new value
			setOptimisticParsedQuery(prev => ({ ...prev, [key]: value }));

			startTransition(() => {
				const path = getSetQueryPath(key, value);
				if (replaceOnChange) {
					router.replace(path, { scroll: false });
				} else {
					router.push(path, { scroll: false });
				}
			});
		},

		[optimisticParsedQuery, router],
	);

	function removeByKey(key: OutputOptionalKeys) {
		startTransition(() => {
			setOptimisticParsedQuery(prev => ({ ...prev, [key]: undefined }));
			// const search = new URLSearchParams(optimisticParsedQuery);
			const search = toSearchParams(optimisticParsedQuery);
			search.delete(String(key));
			// router.replace(`${pathname}?${search.toString()}`, { scroll: false });
			if (replaceOnChange) {
				router.replace(`${pathname}?${search.toString()}`, { scroll: false });
			} else {
				router.push(`${pathname}?${search.toString()}`, { scroll: false });
			}
		});
	}

	// Add this helper function
	const ensureArray = <T>(value: T | T[] | undefined): T[] => {
		return Array.isArray(value) ? value : [];
	};

	// push item to existing key
	function pushItemToKey<J extends ArrayOutputKeys>(key: J, value: ArrayOutputValue<J>) {
		startTransition(() => {
			setOptimisticParsedQuery(prev => ({
				...prev,
				[key]: [...ensureArray(prev[key]), value],
			}));
			const existingValue = optimisticParsedQuery[key];
			if (Array.isArray(existingValue)) {
				if (existingValue.includes(value)) return; // prevent adding the same value to the array
				// @ts-expect-error this is too much for TS it seems
				setQuery(key, [...existingValue, value]);
			} else {
				// @ts-expect-error this is too much for TS it seems
				setQuery(key, [value]);
			}
		});
	}

	// Remove item by key and value
	function removeItemByKeyAndValue<J extends ArrayOutputKeys>(
		key: J,
		value: ArrayOutputValue<J>,
	) {
		startTransition(() => {
			setOptimisticParsedQuery(prev => ({
				...prev,
				[key]: [...ensureArray(prev[key]), value],
			}));
			const existingValue = optimisticParsedQuery[key];

			if (Array.isArray(existingValue) && existingValue.length > 1) {
				const newValue = existingValue.filter(item => item !== value);

				// @ts-expect-error this is too much for TS it seems
				setQuery(key, newValue);
			} else {
				// @ts-expect-error this is too much for TS it seems
				removeByKey(key);
			}
		});
	}

	// Remove all query params from the URL
	function removeAllQueryParams() {
		if (!pathname) return;

		startTransition(() => {
			setOptimisticParsedQuery({} as Output); // fixme: this is a hack to get the type to work
			// router.replace(pathname, { scroll: false });
			if (replaceOnChange) {
				router.replace(pathname, { scroll: false });
			} else {
				router.push(pathname, { scroll: false });
			}
		});
	}

	return {
		data: optimisticParsedQuery,
		pending: pendingTransition,
		getSetQueryPath,
		setQuery,
		removeByKey,
		pushItemToKey,
		removeItemByKeyAndValue,
		removeAllQueryParams,
	};
}
