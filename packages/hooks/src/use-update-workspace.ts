'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useWorkspace } from './use-workspace';

export function useUpdateWorkspace({ onSuccess }: { onSuccess?: () => void } = {}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();
	const router = useRouter();
	const currentPath = usePathname();

	const { mutateAsync: updateWorkspace } = useMutation(
		trpc.workspace.update.mutationOptions({
			onMutate: async data => {
				console.log('onMutate', data);
				await queryClient.cancelQueries(trpc.workspace.byHandle.queryFilter());

				const handleChanged = data.handle !== workspace.handle;

				return {
					handleChanged,
					oldHandle: workspace.handle,
					newHandle: data.handle,
				};
			},
			onSuccess: async (data, variables, context) => {
				if (
					context.handleChanged &&
					context.oldHandle &&
					context.newHandle &&
					currentPath
				) {
					console.log(
						'pushing to',
						currentPath.replace(context.oldHandle, context.newHandle),
					);
					return router.push(currentPath.replace(context.oldHandle, context.newHandle));
				}

				await queryClient.invalidateQueries(trpc.workspace.byHandle.queryFilter());
				onSuccess?.();
			},
			onError: (error, variables, context) => {
				console.error('onError', error, variables, context);
			},
		}),
	);

	return { updateWorkspace };
}
