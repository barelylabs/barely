"use client";

import { Img } from "@barely/ui/elements/img";
import { Text } from "@barely/ui/elements/typography";
import { useAtom } from "jotai";

import type { TrackWith_Workspace_Genres_Files } from "@barely/server/track.schema";

import { ListCard } from "~/app/[handle]/_components/list-card";
import {
  editTrackAtom,
  showTrackModalAtom,
} from "~/app/[handle]/tracks/_components/track-modal";

export function TrackCard(props: { track: TrackWith_Workspace_Genres_Files }) {
  const [, setShowTrackModal] = useAtom(showTrackModalAtom);
  const [editTrack, setEditTrack] = useAtom(editTrackAtom);

  return (
    <ListCard
      item={props.track}
      editItem={editTrack}
      setEditItem={setEditTrack}
      setShowEditModal={(show) => setShowTrackModal(show)}
    >
      <div className="flex flex-grow flex-row items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-row items-center gap-2">
            <Img
              src={props.track.artworkFiles?.find((f) => f.current)?.src ?? ""}
              alt="Track"
              className="h-8 w-8 rounded-md bg-gray-100 sm:h-16 sm:w-16"
              width={40}
              height={40}
            />
            <Text variant="md/semibold" className="text-blue-800">
              {props.track.name}
            </Text>
          </div>
        </div>
      </div>
    </ListCard>
  );
}
