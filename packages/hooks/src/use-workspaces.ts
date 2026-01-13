'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useWorkspaceHandle } from './use-workspace';

export const useWorkspaces = () => {
	const trpc = useTRPC();
	const handle = useWorkspaceHandle();
	const { data: workspaces } = useSuspenseQuery(
		trpc.workspace.all.queryOptions({ handle }),
	);
	return workspaces;
};
