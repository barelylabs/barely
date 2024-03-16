"use client";

import type { z } from "zod";
import { useCallback } from "react";
import { atomWithToggle } from "@barely/lib/atoms/atom-with-toggle";
import { useCreateOrUpdateForm } from "@barely/lib/hooks/use-create-or-update-form";
import { useUpload } from "@barely/lib/hooks/use-upload";
import { api } from "@barely/lib/server/api/react";
import {
  defaultTrack,
  formatWorkspaceTrackToUpsertTrackForm,
  upsertTrackSchema,
} from "@barely/lib/server/track.schema";
import { Badge } from "@barely/ui/elements/badge";
import { Label } from "@barely/ui/elements/label";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@barely/ui/elements/modal";
import { Text } from "@barely/ui/elements/typography";
import { UploadDropzone, UploadQueueList } from "@barely/ui/elements/upload";
import { Form, SubmitButton } from "@barely/ui/forms";
import { TextField } from "@barely/ui/forms/text-field";
import { parseSpotifyLink } from "@barely/utils/link";
import { atom, useAtom } from "jotai";

import type { UploadQueueItem } from "@barely/lib/hooks/use-upload";
import type {
  InsertTrackAudioFile,
  TrackWith_Workspace_Genres_Files,
  UpsertTrack,
} from "@barely/lib/server/track.schema";

export const editTrackAtom = atom<TrackWith_Workspace_Genres_Files | null>(
  null,
);
export const showTrackModalAtom = atomWithToggle(false);

const trackArtworkUploadQueueAtom = atom<UploadQueueItem[]>([]);
const trackAudioUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function TrackModal() {
  const apiUtils = api.useUtils();

  const [editTrack, setEditTrack] = useAtom(editTrackAtom);
  const [, setShowTrackModal] = useAtom(showTrackModalAtom);

  /* api */
  const { mutateAsync: updateTrack } = api.track.update.useMutation({
    onSuccess: async () => {
      await closeModal();
    },
  });

  const { mutateAsync: createTrack } = api.track.create.useMutation({
    onSuccess: async () => {
      await closeModal();
    },
  });

  /* form */
  const { form, onSubmit: onSubmitTrack } = useCreateOrUpdateForm({
    editItem: editTrack
      ? formatWorkspaceTrackToUpsertTrackForm(editTrack)
      : null,
    upsertSchema: upsertTrackSchema,
    defaultValues: defaultTrack,
    handleCreateItem: async (d) => {
      await createTrack(d);
    },
    handleUpdateItem: async (d) => {
      await updateTrack(d);
    },
  });

  /* Artwork upload */
  const artworkUploadState = useUpload({
    uploadQueueAtom: trackArtworkUploadQueueAtom,
    allowedFileTypes: ["image"],
    maxFiles: 1,
  });

  const {
    isPendingPresigns: isPendingPresignsArtwork,
    uploading: uploadingArtwork,
    handleSubmit: handleArtworkUpload,
    uploadQueue: artworkUploadQueue,
    setUploadQueue: setArtworkUploadQueue,
  } = artworkUploadState;

  const artworkImagePreview =
    artworkUploadQueue[0]?.previewImage ??
    editTrack?.artworkFiles?.find((f) => f.current)?.src ??
    "";

  /* Audio upload */
  const audioUploadState = useUpload({
    uploadQueueAtom: trackAudioUploadQueueAtom,
    allowedFileTypes: ["audio"],
    maxFiles: 2,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const {
    isPendingPresigns: isPendingPresignsAudio,
    uploading: uploadingAudio,
    handleSubmit: handleAudioUpload,
    uploadQueue: audioUploadQueue,
    setUploadQueue: setAudioUploadQueue,
  } = audioUploadState;

  const handleSubmit = useCallback(
    async (data: z.infer<typeof upsertTrackSchema>) => {
      const upsertTrackData: UpsertTrack = {
        ...data,
        _artworkFiles: artworkUploadQueue.map((f) => {
          return {
            fileId: f.presigned?.fileId ?? "",
            current: true,
          };
        }),
        _audioFiles: audioUploadQueue
          .map((item) => {
            const af: InsertTrackAudioFile = {
              fileId: item.presigned?.fileId ?? "",
              masterCompressed:
                item.file.type === "audio/mpeg" ||
                item.file.type === "audio/m4a",
              masterWav: item.file.type === "audio/wav",
            };
            return af;
          })
          .filter((f) => f.fileId.length > 0),
      };

      await Promise.all([handleArtworkUpload(), handleAudioUpload()]);
      await onSubmitTrack(upsertTrackData);

      setArtworkUploadQueue([]);
      setAudioUploadQueue([]);
    },
    [
      artworkUploadQueue,
      setArtworkUploadQueue,
      audioUploadQueue,
      setAudioUploadQueue,
      onSubmitTrack,
      handleArtworkUpload,
      handleAudioUpload,
    ],
  );

  const submitDisabled =
    isPendingPresignsArtwork ||
    isPendingPresignsAudio ||
    uploadingArtwork ||
    uploadingAudio;

  // MASTERS
  const masterCompressed = editTrack?.audioFiles?.find(
    (f) => f.masterCompressed,
  );

  const masterWav = editTrack?.audioFiles?.find((f) => f.masterWav);

  const closeModal = useCallback(async () => {
    setShowTrackModal(false);
    setArtworkUploadQueue([]);
    setAudioUploadQueue([]);
    setEditTrack(null);
    form.reset();
    await apiUtils.track.invalidate();
  }, [
    apiUtils.track,
    setEditTrack,
    setShowTrackModal,
    setArtworkUploadQueue,
    setAudioUploadQueue,
    form,
  ]);

  return (
    <Modal
      // showModalAtom={showTrackModalAtom}
      className="w-full"
      preventDefaultClose={
        form.formState.isDirty ||
        artworkUploadQueue.length > 0 ||
        audioUploadQueue.length > 0
      }
    >
      <ModalHeader
        icon="music"
        title={editTrack ? `Edit ${editTrack.name}` : "New track"}
      />
      <Form form={form} onSubmit={handleSubmit}>
        <ModalBody>
          <TextField
            name="name"
            control={form.control}
            label="Track name"
            disabled={!!editTrack}
            allowEnable
          />
          <TextField control={form.control} name="isrc" label="ISRC" />
          <TextField
            control={form.control}
            name="spotifyId"
            label="Spotify ID"
            onPaste={(e) => {
              const input = e.clipboardData.getData("text");
              const parsed = parseSpotifyLink(input);
              if (!input ?? parsed?.type !== "track") return;
              e.preventDefault();
              form.setValue("spotifyId", parsed.id);
            }}
          />

          <div className="flex flex-col items-start gap-1">
            <Label>Artwork</Label>
            <UploadDropzone
              {...artworkUploadState}
              title="Upload album art"
              imagePreview={artworkImagePreview}
            />
            <UploadQueueList uploadQueue={artworkUploadState.uploadQueue} />
          </div>

          <div className="flex flex-col items-start gap-1">
            <Label>Masters</Label>
            {!!masterCompressed && (
              <div className="flex flex-row items-center gap-2">
                <Text variant="xs/normal">Compressed: </Text>
                <a href={masterCompressed.src} target="_blank" rel="noreferrer">
                  <Badge icon="music" variant="info" size="xs">
                    {masterCompressed.name}
                  </Badge>
                </a>
              </div>
            )}

            {!!masterWav && (
              <div className="flex flex-row items-center gap-2">
                <Text variant="xs/normal">Wav: </Text>
                <a href={masterWav.src} target="_blank" rel="noreferrer">
                  <Badge icon="music" variant="info" size="xs">
                    {masterWav.name}
                  </Badge>
                </a>
              </div>
            )}

            <UploadDropzone
              {...audioUploadState}
              title={audioUploadQueue[0]?.file.name ?? "Upload audio"}
              className="h-28 w-96"
            />
            <UploadQueueList uploadQueue={audioUploadState.uploadQueue} />
          </div>
        </ModalBody>
        <ModalFooter>
          {/* <Button
          fullWidth
          disabled={submitDisabled}
          loading={form.formState.isSubmitting}
          onClick={form.handleSubmit((data) => {
            handleSubmit(data).catch((err) => console.error(err));
          })}
          >
          {editTrack ? "Save Track" : "Create Track"}
        </Button> */}
          <SubmitButton fullWidth disabled={submitDisabled}>
            {editTrack ? "Save Track" : "Create Track"}
          </SubmitButton>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
