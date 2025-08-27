'use client';

import type { z } from 'zod/v4';
import { usePathname, useRouter } from 'next/navigation';
import { updateWorkspaceSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useWorkspaceWithAll } from './use-workspace';
import { useZodForm } from './use-zod-form';

export function useWorkspaceUpdateForm() {
	const workspace = useWorkspaceWithAll();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		// defaultValues,
		values: workspace satisfies z.infer<typeof updateWorkspaceSchema>,
		resetOptions: {
			keepDirtyValues: true, // retain user-interacted input
		},
	});

	const router = useRouter();
	const currentPath = usePathname();

	const { mutate: updateWorkspace } = useMutation(
		trpc.workspace.update.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries(trpc.workspace.byHandle.pathFilter());

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
					return router.push(currentPath.replace(context.oldHandle, context.newHandle));
				}

				await queryClient.invalidateQueries(trpc.workspace.byHandle.pathFilter());
				form.reset();
			},
		}),
	);

	const onSubmit = (data: z.infer<typeof updateWorkspaceSchema>) => {
		updateWorkspace({
			...data,
			handle: workspace.handle,
		});
	};

	return { form, onSubmit, isPersonal: workspace.type === 'personal' };
}
