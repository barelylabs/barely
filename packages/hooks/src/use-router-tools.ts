'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useRouterTools() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const searchParamsObj = Object.fromEntries(searchParams);

	const getQueryString = (kv?: Record<string, string>) => {
		const newParams = new URLSearchParams(searchParams);
		if (kv) {
			Object.entries(kv).forEach(([k, v]) => newParams.set(k, v));
		}
		const queryString = newParams.toString();
		return queryString.length > 0 ? `?${queryString}` : '';
	};

	const queryParams = ({
		set,
		del,
		replace,
		getNewPath,
	}: {
		set?: Record<string, string>;
		del?: string | string[];
		replace?: boolean;
		getNewPath?: boolean;
	}) => {
		const newParams = new URLSearchParams(searchParams);
		if (set) {
			Object.entries(set).forEach(([k, v]) => newParams.set(k, v));
		}
		if (del) {
			if (Array.isArray(del)) {
				del.forEach(k => newParams.delete(k));
			} else {
				newParams.delete(del);
			}
		}
		const queryString = newParams.toString();
		const newPath = `${pathname}${queryString.length > 0 ? `?${queryString}` : ''}`;
		if (getNewPath) return newPath;
		if (replace) {
			router.replace(newPath);
		} else {
			router.push(newPath);
		}
	};

	return {
		pathname,
		router,
		searchParams,
		searchParamsObj,
		queryParams,
		getQueryString,
	};
}
