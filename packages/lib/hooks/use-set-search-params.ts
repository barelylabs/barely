'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

export function useSetSearchParams() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const params = new URLSearchParams(searchParams?.toString());

	const setSearchParam = (
		key: string,
		value: string,
		refresh: boolean | undefined = false,
	) => {
		params.set(key, value);
		const newUrl = `${pathname}?${params.toString()}`;
		router.push(newUrl).catch(err => console.error(err));

		if (refresh) {
			router.reload();
		}
	};

	return setSearchParam;
}
