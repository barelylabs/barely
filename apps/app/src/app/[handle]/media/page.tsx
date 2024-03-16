import type { z } from "zod";
import { redirect } from "next/navigation";
import { fileSearchParamsSchema } from "@barely/lib/server/file.schema";

import { DashContentHeader } from "~/app/[handle]/_components/dash-content-header";
import { AllMedia } from "~/app/[handle]/media/_components/all-media";
import { MediaContextProvider } from "~/app/[handle]/media/_components/media-context";
import { UploadMediaButton } from "~/app/[handle]/media/_components/upload-media-button";
import { UploadMediaModal } from "~/app/[handle]/media/_components/upload-media-modal";

export default function MediaLibraryPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams: z.infer<typeof fileSearchParamsSchema>;
}) {
  const parsedFilters = fileSearchParamsSchema.safeParse(searchParams);
  if (!parsedFilters.success) {
    console.log("failed to parse filters", parsedFilters.error);
    redirect(`/${params.handle}/files`);
  }

  const { selectedFileIds, ...filters } = parsedFilters.data;

  return (
    <>
      <MediaContextProvider selectedFileIds={selectedFileIds} filters={filters}>
        <DashContentHeader
          title="Media Library"
          button={<UploadMediaButton />}
        />
        <AllMedia />
        <UploadMediaModal />
      </MediaContextProvider>
    </>
  );
}
