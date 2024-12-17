import type { z } from 'zod';

import type { selectWorkspaceFilesSchema } from '../server/routes/file/file.schema';
import { api } from '../server/api/react';
import { useWorkspace } from './use-workspace';

type UseFilesProps = Omit<
	z.infer<typeof selectWorkspaceFilesSchema>,
	'handle' | 'cursor'
>;

export function useFiles(props?: UseFilesProps) {
	const { handle } = useWorkspace();

	const {
		data,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = api.file.byWorkspace.useInfiniteQuery(
		{
			handle,
			...props,
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const files = data?.pages.flatMap(page => page.files) ?? [];

	return {
		files,
		hasMoreFiles: !!hasNextPage,
		fetchMoreFiles: fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	};
}
