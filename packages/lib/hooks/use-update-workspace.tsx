import { usePathname, useRouter } from 'next/navigation';

import { api } from '../server/api/react';
import { useWorkspace } from './use-workspace';

export function useUpdateWorkspace({ onSuccess }: { onSuccess?: () => void } = {}) {
	const { workspace } = useWorkspace();
	const apiUtils = api.useUtils();
	const router = useRouter();
	const currentPath = usePathname();

	const { mutateAsync: updateWorkspace } = api.workspace.update.useMutation({
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
			onSuccess?.();
		},
	});

	return { updateWorkspace };
}
