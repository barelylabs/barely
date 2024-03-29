import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAtom, useSetAtom } from 'jotai';

import type { NavHistory } from '../atoms/navigation-history.atom';
import { navHistoryAtom } from '../atoms/navigation-history.atom';

export function useUpdateNavHistory() {
	const pathname = usePathname();
	const setNavHistory = useSetAtom(navHistoryAtom);

	useEffect(() => {
		setNavHistory(prev => {
			if (!pathname) return prev;

			const newHistory: NavHistory = {
				...prev,
				currentPath: pathname,
				settingsBackPath:
					pathname?.includes('/settings/') && !prev.currentPath?.includes('/settings/')
						? prev.currentPath
						: prev.settingsBackPath,
				history:
					pathname === prev.history[0] ? prev.history : [pathname, ...prev.history],
			};

			return newHistory;
		});
	}, [pathname, setNavHistory]);
}

export function useNavHistory() {
	return useAtom(navHistoryAtom);
}
