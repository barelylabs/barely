import type { InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import type { FileRecord, PublicAudio, PublicImage } from "./file.schema";
import type {
  _Files_To_Tracks__Artwork,
  _Files_To_Tracks__Audio,
} from "./file.sql";
import type { Genre } from "./genre.schema";
import type { PublicWorkspace, Workspace } from "./workspace.schema";
import { queryStringArraySchema } from "../hooks/use-typed-query";
import { genreIdSchema } from "./genre.schema";
import { Tracks } from "./track.sql";

const insertTrackAudioFilesSchema = z.array(
  z.object({
    fileId: z.string(),
    masterCompressed: z.boolean().optional(),
    masterWav: z.boolean().optional(),
    instrumentalCompressed: z.boolean().optional(),
    instrumentalWav: z.boolean().optional(),
    stem: z.boolean().optional(),
  }),
);

export type InsertTrackAudioFile = z.infer<
  typeof insertTrackAudioFilesSchema
>[number];

export const insertTrackArtworkFilesSchema = z.array(
  z.object({
    fileId: z.string(),
    current: z.boolean().optional(),
  }),
);

export type InsertTrackArtworkFile = z.infer<
  typeof insertTrackArtworkFilesSchema
>[number];

export const insertTrackSchema = createInsertSchema(Tracks, {
  name: (schema) =>
    schema.name.min(1, "Name is required").max(255, "Name is too long"),
  isrc: (schema) => schema.isrc.transform((v) => (!v?.length ? null : v)),
  appleMusicId: (schema) =>
    schema.appleMusicId.transform((v) => (!v?.length ? null : v)),
  deezerId: (schema) =>
    schema.deezerId.transform((v) => (!v?.length ? null : v)),
  soundcloudId: (schema) =>
    schema.soundcloudId.transform((v) => (!v?.length ? null : v)),
  spotifyId: (schema) =>
    schema.spotifyId.transform((v) => (!v?.length ? null : v)),
  tidalId: (schema) => schema.tidalId.transform((v) => (!v?.length ? null : v)),
  youtubeId: (schema) =>
    schema.youtubeId.transform((v) => (!v?.length ? null : v)),
  releaseDate: (schema) =>
    schema.releaseDate.transform((v) => (!v?.length ? null : v)),
}).extend({
  _genres: z.array(genreIdSchema).optional(),
  _artworkFiles: insertTrackArtworkFilesSchema.optional(),
  _audioFiles: insertTrackAudioFilesSchema.optional(),
});

export const createTrackSchema = insertTrackSchema.omit({
  id: true,
  workspaceId: true,
});
export const upsertTrackSchema = insertTrackSchema.partial({
  id: true,
  workspaceId: true,
});
export const updateTrackSchema = insertTrackSchema
  .partial()
  .required({ id: true });

export const selectTrackSchema = createSelectSchema(Tracks);

export type Track = z.infer<typeof selectTrackSchema>;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type CreateTrack = z.infer<typeof createTrackSchema>;
export type UpsertTrack = z.infer<typeof upsertTrackSchema>;
export type UpdateTrack = z.infer<typeof updateTrackSchema>;

// forms
export const defaultTrack: UpsertTrack = {
  name: "",
  isrc: "",

  appleMusicId: "",
  deezerId: "",
  soundcloudId: "",
  spotifyId: "",
  tidalId: "",
  youtubeId: "",

  released: false,
  releaseDate: "",

  _genres: [],
  _artworkFiles: [],
  _audioFiles: [],
} as const;

export const formatWorkspaceTrackToUpsertTrackForm = (
  track: TrackWith_Workspace_Genres_Files,
) => {
  return {
    ...track,
    isrc: track.isrc ?? "",
    appleMusicId: track.appleMusicId ?? "",
    deezerId: track.deezerId ?? "",
    soundcloudId: track.soundcloudId ?? "",
    spotifyId: track.spotifyId ?? "",
    tidalId: track.tidalId ?? "",
    youtubeId: track.youtubeId ?? "",
    releaseDate: track.releaseDate ?? "",
  } satisfies TrackWith_Workspace_Genres_Files;
};

// queries
type TrackArtworkFile = Omit<
  InferSelectModel<typeof _Files_To_Tracks__Artwork>,
  "fileId" | "trackId"
> &
  FileRecord;
type TrackAudioFile = Omit<
  InferSelectModel<typeof _Files_To_Tracks__Audio>,
  "fileId" | "trackId"
> &
  FileRecord;

export interface TrackWith_Workspace_Genres_Files extends Track {
  workspace: Workspace;
  genres: Genre[];
  artworkFiles?: TrackArtworkFile[];
  audioFiles?: TrackAudioFile[];
}

// public
export type PublicTrack = Pick<
  Track,
  "id" | "name" | "isrc" | "releaseDate"
> & {
  artworkUrl?: string;
  audioUrl?: string;
};

export interface PublicTrackWith_Artist_Files extends PublicTrack {
  workspace: PublicWorkspace;
  artwork?: PublicImage;
  audioFiles: PublicAudio[];
}

// query params
export const trackFilterParamsSchema = z.object({
  search: z.string().optional(),
  genres: queryStringArraySchema.optional(),
  released: z.boolean().optional(),
  selectedTrackIds: queryStringArraySchema.optional(),
});
