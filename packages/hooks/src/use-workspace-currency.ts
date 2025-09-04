'use client';

import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useWorkspace } from './use-workspace';

export function useWorkspaceCurrency() {
	const { handle } = useWorkspace();
	const trpc = useTRPC();

	const { data: workspaceWithAll } = useQuery({
		...trpc.workspace.byHandleWithAll.queryOptions({ handle }),
	});

	return workspaceWithAll?.currency ?? 'usd';
}
