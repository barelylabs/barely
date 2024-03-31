import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAtom, useSetAtom } from 'jotai';

import type { NavHistory } from '../atoms/navigation-history.atom';
import { navHistoryAtom } from '../atoms/navigation-history.atom';
import { useWorkspace } from './use-workspace';
import { useWorkspaces } from './use-workspaces';

export function useUpdateNavHistory() {
	const pathname = usePathname();
	const workspace = useWorkspace();
	const workspaces = useWorkspaces();
	const setNavHistory = useSetAtom(navHistoryAtom);

	useEffect(() => {
		console.log('pathname => ', pathname);

		setNavHistory(prev => {
			if (!pathname) return prev;

			const defaultSettingsBackPath = `/${workspace.handle}/links`;

			let settingsBackPath = prev.settingsBackPath?.includes(
				`/${workspace.handle}/settings`,
			)
				? defaultSettingsBackPath
				: prev.settingsBackPath ?? defaultSettingsBackPath;

			if (
				workspaces.some(w => pathname?.includes(`/${w.handle}/settings`)) &&
				!workspaces.some(w => prev.currentPath?.includes(`/${w.handle}/settings`))
			) {
				settingsBackPath = prev.currentPath ?? defaultSettingsBackPath;
			}

			console.log('settingsBackPath => ', settingsBackPath);
			const newHistory: NavHistory = {
				...prev,
				currentPath: pathname,
				settingsBackPath,
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
