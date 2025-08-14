import { useWorkspace } from '@barely/hooks';
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

export function useBrandKit() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();

	// Get current workspace's brand kit using suspense
	const { data: brandKit } = useSuspenseQuery({
		...trpc.brandKit.current.queryOptions({ handle: workspace.handle }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Update brand kit mutation
	const updateMutation = useMutation({
		...trpc.brandKit.update.mutationOptions(),
		onSuccess: () => {
			toast.success('Brand kit updated successfully');
			void queryClient.invalidateQueries({
				queryKey: trpc.brandKit.current.queryKey({ handle: workspace.handle }),
			});
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to update brand kit');
		},
	});

	// Migrate from bio settings
	const migrateMutation = useMutation({
		...trpc.brandKit.migrateFromBio.mutationOptions(),
		onSuccess: () => {
			toast.success('Successfully migrated bio settings to brand kit');
			void queryClient.invalidateQueries({
				queryKey: trpc.brandKit.current.queryKey({ handle: workspace.handle }),
			});
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to migrate bio settings');
		},
	});

	return {
		brandKit,
		updateBrandKit: updateMutation.mutate,
		isUpdating: updateMutation.isPending,
		migrateFromBio: migrateMutation.mutate,
		isMigrating: migrateMutation.isPending,
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
	const updateMutation = useMutation({
		...trpc.brandKit.update.mutationOptions(),
		onSuccess: () => {
			toast.success('Brand kit updated successfully');
			void queryClient.invalidateQueries({
				queryKey: trpc.brandKit.current.queryKey({ handle: workspace.handle }),
			});
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to update brand kit');
		},
	});

	// Migrate from bio settings
	const migrateMutation = useMutation({
		...trpc.brandKit.migrateFromBio.mutationOptions(),
		onSuccess: () => {
			toast.success('Successfully migrated bio settings to brand kit');
			void queryClient.invalidateQueries({
				queryKey: trpc.brandKit.current.queryKey({ handle: workspace.handle }),
			});
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to migrate bio settings');
		},
	});

	return {
		brandKit,
		isLoading,
		updateBrandKit: updateMutation.mutate,
		isUpdating: updateMutation.isPending,
		migrateFromBio: migrateMutation.mutate,
		isMigrating: migrateMutation.isPending,
	};
}
