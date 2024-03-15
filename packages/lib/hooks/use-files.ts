import type { z } from "zod";

import type { selectWorkspaceFilesSchema } from "../server/file.schema";
import { api } from "../server/api/react";
import { useWorkspace } from "./use-workspace";

type UseFilesProps = Omit<
  z.infer<typeof selectWorkspaceFilesSchema>,
  "handle" | "cursor"
> & {
  // initialFiles?: EdgeRouterOutputs["file"]["byWorkspace"];
};

export function useFiles(props?: UseFilesProps) {
  const { handle } = useWorkspace();

  const infiniteFilesQuery = api.file.byWorkspace.useInfiniteQuery(
    {
      handle,
      ...props,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const files =
    infiniteFilesQuery.data?.pages.flatMap((page) => page.files) ?? [];

  return {
    files,
    hasMoreFiles: !!infiniteFilesQuery.hasNextPage,
    fetchMoreFiles: infiniteFilesQuery.fetchNextPage,
    _query: infiniteFilesQuery,
  };
}
