'use client';

import { usePathname } from 'next/navigation';

export function usePathnameMatchesCurrentGroup(paths: string[]) {
	const pathname = usePathname() as null | string;

	return paths.some(path => (pathname ? pathname === path : false));
}
