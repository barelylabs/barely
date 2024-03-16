"use client";

import { useCallback } from "react";
import { api } from "@barely/lib/server/api/react";

import { ArchiveOrDeleteModal } from "~/app/[handle]/_components/archive-or-delete-modal";
import { useTrackContext } from "~/app/[handle]/tracks/_components/track-context";

export function ArchiveOrDeleteTrackModal({
  mode,
}: {
  mode: "archive" | "delete";
}) {
  const {
    trackSelection,
    lastSelectedTrack,
    showArchiveTrackModal,
    showDeleteTrackModal,
    setShowArchiveTrackModal,
    setShowDeleteTrackModal,
  } = useTrackContext();

  const apiUtils = api.useUtils();

  const showModal =
    mode === "archive" ? showArchiveTrackModal : showDeleteTrackModal;

  const setShowModal =
    mode === "archive" ? setShowArchiveTrackModal : setShowDeleteTrackModal;

  const onSuccess = useCallback(async () => {
    await apiUtils.track.invalidate();
    setShowModal(false);
  }, [apiUtils.track, setShowModal]);

  const { mutate: archiveTracks, isPending: isPendingArchive } =
    api.track.archive.useMutation({ onSuccess });

  const { mutate: deleteTracks, isPending: isPendingDelete } =
    api.track.delete.useMutation({ onSuccess });

  if (!lastSelectedTrack) return null;

  return (
    <ArchiveOrDeleteModal
      mode={mode}
      selection={trackSelection}
      lastSelected={lastSelectedTrack}
      showModal={showModal}
      setShowModal={setShowModal}
      archiveItems={archiveTracks}
      deleteItems={deleteTracks}
      isPendingArchive={isPendingArchive}
      isPendingDelete={isPendingDelete}
      itemName="track"
    />
  );
}
