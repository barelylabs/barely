'use client';

import type { selectWorkspaceFilesSchema } from '@barely/validators';
import type { z } from 'zod/v4';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useWorkspace } from './use-workspace';

type UseFilesProps = Omit<
	z.input<typeof selectWorkspaceFilesSchema>,
	'handle' | 'cursor'
>;

export function useFiles(props?: UseFilesProps) {
	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const {
		data,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.file.byWorkspace.infiniteQueryOptions(
			{
				handle,
				...props,
			},
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const files = data.pages.flatMap(page => page.files);

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
