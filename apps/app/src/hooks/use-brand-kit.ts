import type { UpdateBrandKit } from '@barely/validators';
import { useWorkspace } from '@barely/hooks';
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/app.trpc.react';

export function useBrandKit() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();

	// Get current workspace's brand kit using suspense
	const { data: brandKit } = useSuspenseQuery({
		...trpc.brandKit.current.queryOptions({ handle: workspace.handle }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const updateBrandKitPreview = async (data: Omit<UpdateBrandKit, 'id'>) => {
		console.log('updating brand kit preview', data);
		await queryClient.cancelQueries({
			queryKey: trpc.brandKit.current.queryKey({ handle: workspace.handle }),
		});
		const previousBrandKit = queryClient.getQueryData(
			trpc.brandKit.current.queryKey({ handle: workspace.handle }),
		);
		if (!previousBrandKit) {
			throw new Error('Previous brand kit not found');
		}
		const updatedBrandKit = {
			...previousBrandKit,
			...data,
		};
		console.log('updated brand kit', updatedBrandKit);
		queryClient.setQueryData(
			trpc.brandKit.current.queryKey({ handle: workspace.handle }),
			updatedBrandKit,
		);
		return { previousBrandKit };
	};

	// Update brand kit mutation
	const updateMutation = useMutation(
		trpc.brandKit.update.mutationOptions({
			onMutate: updateBrandKitPreview,
			onSuccess: () => {
				toast.success('Brand kit updated successfully');
			},
			onError: error => {
				toast.error(error.message);
			},
			onSettled: () => {
				void queryClient.invalidateQueries({
					queryKey: trpc.brandKit.current.queryKey({ handle: workspace.handle }),
				});
			},
		}),
	);

	return {
		brandKit,
		updateBrandKit: updateMutation.mutate,
		updateBrandKitPreview,
		isUpdating: updateMutation.isPending,
	};
}

// Non-suspense version for backwards compatibility if needed
export function useBrandKitLegacy() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();

	// Get current workspace's brand kit
	const { data: brandKit, isLoading } = useQuery({
		...trpc.brandKit.current.queryOptions({ handle: workspace.handle }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Update brand kit mutation
	const updateMutation = useMutation(
		trpc.brandKit.update.mutationOptions({
			onSuccess: () => {
				toast.success('Brand kit updated successfully');
				void queryClient.invalidateQueries({
					queryKey: trpc.brandKit.current.queryKey({ handle: workspace.handle }),
				});
			},
			onError: error => {
				toast.error(error.message);
			},
		}),
	);

	return {
		brandKit,
		isLoading,
		updateBrandKit: updateMutation.mutate,
		isUpdating: updateMutation.isPending,
	};
}
