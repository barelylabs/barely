'use client';

import type { NavHistory } from '@barely/atoms/navigation-history';
import type { SessionWorkspace } from '@barely/auth';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAtom, useSetAtom } from 'jotai';

import { navHistoryAtom } from '@barely/atoms/navigation-history';

import { useWorkspace } from './use-workspace';
import { useWorkspaces } from './use-workspaces';

export function useUpdateNavHistory() {
	const pathname = usePathname();
	const { workspace } = useWorkspace();
	const workspaces = useWorkspaces();
	const setNavHistory = useSetAtom(navHistoryAtom);

	useEffect(() => {
		setNavHistory((prev: NavHistory) => {
			if (!pathname) return prev;

			const defaultSettingsBackPath = `/${workspace.handle}/links`;

			let settingsBackPath =
				prev.settingsBackPath?.includes(`/${workspace.handle}/settings`) ?
					defaultSettingsBackPath
				:	(prev.settingsBackPath ?? defaultSettingsBackPath);

			if (
				workspaces.some((w: SessionWorkspace) =>
					pathname.includes(`/${w.handle}/settings`),
				) &&
				!workspaces.some((w: SessionWorkspace) =>
					prev.currentPath?.includes(`/${w.handle}/settings`),
				)
			) {
				settingsBackPath = prev.currentPath ?? defaultSettingsBackPath;
			}

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
