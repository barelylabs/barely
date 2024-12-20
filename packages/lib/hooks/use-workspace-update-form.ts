import type { z } from 'zod';
import { usePathname, useRouter } from 'next/navigation';

import { api } from '../server/api/react';
import { updateWorkspaceSchema } from '../server/routes/workspace/workspace.schema';
import { useWorkspace } from './use-workspace';
import { useZodForm } from './use-zod-form';

export function useWorkspaceUpdateForm() {
	const { workspace } = useWorkspace();
	const apiUtils = api.useUtils();

	// const defaultValues: UpdateWorkspace = {
	// 	id: workspace.id,
	// };

	// for (const key of updateKeys) {
	// 	if (key in workspace) {
	// 		defaultValues[key] = workspace[key] as UpdateWorkspace[typeof key];
	// 	}
	// }

	// const updateValues = updateKeys.reduce<Partial<UpdateWorkspace>>((acc, key) => {
	// 	if (key in workspace) {
	// 		acc[key] = workspace[key] as UpdateWorkspace[keyof UpdateWorkspace];
	// 	}
	// 	return acc;
	// }, {});

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		// defaultValues,
		values: workspace,
		resetOptions: {
			keepDirtyValues: true, // retain user-interacted input
		},
	});

	const router = useRouter();
	const currentPath = usePathname();

	const { mutate: updateWorkspace } = api.workspace.update.useMutation({
		onMutate: async data => {
			console.log('onMutate', data);
			await apiUtils.workspace.current.cancel();

			const handleChanged = data.handle !== workspace.handle;

			return {
				handleChanged,
				oldHandle: workspace.handle,
				newHandle: data.handle,
			};
		},
		onSuccess: async (data, variables, context) => {
			if (
				context?.handleChanged &&
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

			await apiUtils.workspace.current.invalidate();
			form.reset();
		},
	});

	const onSubmit = (data: z.infer<typeof updateWorkspaceSchema>) => {
		updateWorkspace(data);
	};

	return { form, onSubmit, isPersonal: workspace.type === 'personal' };
}
