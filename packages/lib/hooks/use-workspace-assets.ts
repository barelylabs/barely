import { keepPreviousData } from '@tanstack/react-query';

import { api } from '../server/api/react';
import { useWorkspace } from './use-workspace';

export function useWorkspaceAssets({
	types,
	search,
}: {
	types?: ('cartFunnel' | 'pressKit' | 'landingPage')[];
	search?: string;
}) {
	const workspace = useWorkspace();

	const { data, isPlaceholderData } = api.workspace.assets.useQuery(
		{
			handle: workspace.handle,
			types,
			search,
		},
		{
			placeholderData: keepPreviousData,
		},
	);

	return { assets: data, isPlaceholderAssets: isPlaceholderData };
}
