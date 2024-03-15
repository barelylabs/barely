"use client";

import { NoResultsPlaceholder } from "@barely/ui/components/no-results-placeholder";
import { GridList, GridListCard } from "@barely/ui/elements/grid-list";
import { Img } from "@barely/ui/elements/img";
import { Text } from "@barely/ui/elements/typography";

import type { EdgeRouterOutputs } from "@barely/lib/server/api/router.edge";

import { CreateTrackButton } from "~/app/[handle]/tracks/_components/create-track-button";
import { useTrackContext } from "~/app/[handle]/tracks/_components/track-context";

export function AllTracks() {
  const {
    tracks,
    trackSelection,
    lastSelectedTrackId,
    setTrackSelection,
    gridListRef,
    setShowEditTrackModal,
  } = useTrackContext();

  return (
    <GridList
      glRef={gridListRef}
      aria-label="Tracks"
      className="flex flex-col gap-2"
      // behavior
      selectionMode="multiple"
      selectionBehavior="replace"
      // tracks
      items={tracks}
      selectedKeys={trackSelection}
      setSelectedKeys={setTrackSelection}
      onAction={() => {
        if (!lastSelectedTrackId) return;
        setShowEditTrackModal(true);
      }}
      // empty
      renderEmptyState={() => (
        <NoResultsPlaceholder
          icon="track"
          title="No tracks found."
          subtitle="Create a new track to get started."
          button={<CreateTrackButton />}
        />
      )}
    >
      {(track) => <TrackCard track={track} />}
    </GridList>
  );
}

function TrackCard({
  track,
}: {
  track: EdgeRouterOutputs["track"]["byWorkspace"][0];
}) {
  const {
    setShowEditTrackModal,
    setShowArchiveTrackModal,
    setShowDeleteTrackModal,
  } = useTrackContext();

  return (
    <GridListCard
      id={track.id}
      key={track.id}
      textValue={track.name}
      setShowUpdateModal={setShowEditTrackModal}
      setShowArchiveModal={setShowArchiveTrackModal}
      setShowDeleteModal={setShowDeleteTrackModal}
    >
      <div className="flex flex-grow flex-row items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-row items-center gap-2">
            <Img
              src={track.artworkFiles?.find((f) => f.current)?.src ?? ""}
              alt="Track"
              className="h-8 w-8 rounded-md bg-gray-100 sm:h-16 sm:w-16"
              width={40}
              height={40}
            />
            <Text variant="md/semibold" className="text-blue-800">
              {track.name}
            </Text>
          </div>
        </div>
      </div>
    </GridListCard>
  );
}
