'use client';

import { useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { WorkspaceContext } from '~/app/[handle]/_components/workspace-context';

export function useAppPageView() {
	const trpc = useTRPC();
	const pathname = usePathname();
	const workspace = useContext(WorkspaceContext);
	const lastPathRef = useRef<string | null>(null);

	const { mutate: trackEvent } = useMutation(
		trpc.appAnalytics.trackAppEvent.mutationOptions({}),
	);

	useEffect(() => {
		if (pathname === lastPathRef.current) return;
		lastPathRef.current = pathname;

		trackEvent({
			type: 'app/pageView',
			pagePath: pathname,
			workspaceId: workspace?.id,
		});
	}, [pathname, trackEvent, workspace?.id]);
}
