'use client';

import type { SessionWorkspace } from '@barely/auth';
import { useCallback } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useTypedOptimisticParams } from './use-typed-optimistic-params';

export function useWorkspaceHandle() {
	const { params } = useTypedOptimisticParams(z.object({ handle: z.string() }));

	// params will be undefined if parsing failed
	if (params?.handle) {
		return params.handle;
	}

	throw new Error('No handle found');
}

export function useWorkspace({ onBeginSet }: { onBeginSet?: () => void } = {}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	// Use the optimistic params hook
	const { params, setParam, pending } = useTypedOptimisticParams(
		z.object({ handle: z.string() }),
	);

	const currentHandle = params?.handle;
	if (!currentHandle) throw new Error('No handle found');

	const { data: currentWorkspace } = useSuspenseQuery({
		...trpc.workspace.byHandle.queryOptions({ handle: currentHandle }),
	});

	const setWorkspace = useCallback(
		async function (newWorkspace: SessionWorkspace) {
			console.log('setting workspace to ', newWorkspace, 'from', currentWorkspace);
			onBeginSet?.();

			// Cancel any in-flight queries
			await queryClient.cancelQueries(trpc.workspace.byHandle.queryFilter());

			// Set the new workspace data in the query cache
			queryClient.setQueryData(
				trpc.workspace.byHandle.queryKey({ handle: newWorkspace.handle }),
				newWorkspace,
			);

			// Update the handle param - this triggers navigation and callbacks
			setParam('handle', newWorkspace.handle, {
				onAfterNavigate: async ({ handle }) => {
					// Invalidate to refetch fresh data after navigation completes
					await queryClient.invalidateQueries(
						trpc.workspace.byHandle.queryFilter({ handle }),
					);
				},
			});
		},
		[queryClient, trpc, currentWorkspace, onBeginSet, setParam],
	);

	return {
		workspace: currentWorkspace,
		handle: currentWorkspace.handle,
		setWorkspace,
		pendingTransition: pending,
		isPersonal: currentWorkspace.type === 'personal',
	};
}

export function useWorkspaceIsPersonal() {
	const { workspace } = useWorkspace();

	return workspace.type === 'personal';
}

export function useWorkspaceWithAll() {
	const handle = useWorkspaceHandle();
	const trpc = useTRPC();
	const { data: workspace } = useSuspenseQuery(
		trpc.workspace.byHandleWithAll.queryOptions({
			handle,
		}),
	);

	if (!workspace) throw new Error('Workspace not found to get all fields');

	return workspace;
}
