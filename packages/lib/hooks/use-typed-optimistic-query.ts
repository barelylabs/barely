'use client';

// import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { z } from 'zod';
import { useCallback, useEffect, useOptimistic, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useRouterQuery } from './use-router-query';

type OptionalKeys<T> = {
	[K in keyof T]-?: Record<string, unknown> extends Pick<T, K> ? K : never;
}[keyof T];

type FilteredKeys<T, U> = {
	[K in keyof T as T[K] extends U ? K : never]: T[K];
};

export function useTypedOptimisticQuery<T extends z.AnyZodObject>(schema: T) {
	type Output = z.infer<typeof schema>;
	type FullOutput = Required<Output>;
	type OutputKeys = Required<keyof FullOutput>;
	type OutputOptionalKeys = OptionalKeys<Output>;
	type ArrayOutput = FilteredKeys<FullOutput, unknown[]>;
	type ArrayOutputKeys = keyof ArrayOutput;

	const router = useRouter();
	const unparsedQuery = useRouterQuery();
	const pathname = usePathname();

	const [pendingTransition, startTransition] = useTransition();

	const parsedQuerySchema =
		unparsedQuery ? schema.safeParse(unparsedQuery) : schema.safeParse({});

	const initialParsedQuery: Output =
		parsedQuerySchema.success ? parsedQuerySchema.data : ({} as Output);

	const [optimisticParsedQuery, setOptimisticParsedQuery] =
		useOptimistic<Output>(initialParsedQuery);

	// let parsedQuery: Output = useMemo(() => {
	// 	return {} as Output;
	// }, []);

	useEffect(() => {
		if (parsedQuerySchema.success && parsedQuerySchema.data && unparsedQuery) {
			Object.entries(parsedQuerySchema.data).forEach(([key, value]) => {
				if (key in unparsedQuery || !value) return;
				const search = new URLSearchParams(optimisticParsedQuery);
				search.set(String(key), String(value));
				router.replace(`${pathname}?${search.toString()}`, { scroll: false });
			});
		}
	}, [parsedQuerySchema, schema, router, pathname, unparsedQuery, optimisticParsedQuery]);

	// if (parsedQuerySchema.success) parsedQuery = parsedQuerySchema.data;
	// else if (!parsedQuerySchema.success) console.error(parsedQuerySchema.error);

	const getSetQueryPath = useCallback(
		function getSetQueryPath<J extends OutputKeys>(key: J, value: Output[J]) {
			const search = new URLSearchParams(optimisticParsedQuery);
			search.set(String(key), String(value));
			return `${pathname}?${search.toString()}`;
		},
		[optimisticParsedQuery, pathname, router],
	);

	const setQuery = useCallback(
		function setQuery<J extends OutputKeys>(key: J, value: Output[J]) {
			// Remove old value by key so we can merge new value
			startTransition(() => {
				setOptimisticParsedQuery(prev => ({ ...prev, [key]: value }));
				const path = getSetQueryPath(key, value);
				router.replace(path, { scroll: false });
				// const search = new URLSearchParams(optimisticParsedQuery);
				// search.set(String(key), String(value));
				// router.replace(`${pathname}?${search.toString()}`, { scroll: false });
			});
		},

		[optimisticParsedQuery, router],
	);

	function removeByKey(key: OutputOptionalKeys) {
		startTransition(() => {
			setOptimisticParsedQuery(prev => ({ ...prev, [key]: undefined }));
			const search = new URLSearchParams(optimisticParsedQuery);
			search.delete(String(key));
			router.replace(`${pathname}?${search.toString()}`, { scroll: false });
		});
	}

	// push item to existing key
	function pushItemToKey<J extends ArrayOutputKeys>(
		key: J,
		value: ArrayOutput[J][number],
	) {
		startTransition(() => {
			setOptimisticParsedQuery(prev => ({
				...prev,
				[key]: [...(prev[key] || []), value],
			}));
			const existingValue = optimisticParsedQuery[key];
			if (Array.isArray(existingValue)) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
		value: ArrayOutput[J][number],
	) {
		startTransition(() => {
			setOptimisticParsedQuery(prev => ({
				...prev,
				[key]: [...(prev[key] || []), value],
			}));
			const existingValue = optimisticParsedQuery[key];

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
		});
	}

	// Remove all query params from the URL
	function removeAllQueryParams() {
		if (!pathname) return;

		startTransition(() => {
			setOptimisticParsedQuery({});
			router.replace(pathname, { scroll: false });
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
