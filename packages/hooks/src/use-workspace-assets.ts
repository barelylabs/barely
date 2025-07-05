'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useWorkspace } from './use-workspace';

export function useWorkspaceAssets({
	types,
	search,
}: {
	types?: ('cartFunnel' | 'pressKit' | 'landingPage')[];
	search?: string;
}) {
	const trpc = useTRPC();
	const { workspace } = useWorkspace();

	const { data } = useSuspenseQuery({
		...trpc.workspace.assets.queryOptions({
			handle: workspace.handle,
			types,
			search,
		}),
	});

	return { assets: data };
}
