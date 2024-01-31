import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import type { Genre } from "./genre.schema";
import type { Track } from "./track.schema";
import type { Workspace } from "./workspace.schema";
// import { APP_BASE_URL } from "../utils/constants";

import { playlistPitchSettings } from "./campaign.settings";
import { Campaigns } from "./campaign.sql";
import { insertGenreSchema } from "./genre.schema";
import { getTotalPlaylistReachByGenres_SA } from "./playlist.actions";
import { createTrackSchema, upsertTrackSchema } from "./track.schema";
import { newUserContactInfoSchemaWithRole } from "./user.schema";
import {
  createWorkspaceSchema,
  upsertWorkspaceSchema,
} from "./workspace.schema";

export const insertCampaignSchema = createInsertSchema(Campaigns);
export const createCampaignSchema = insertCampaignSchema.omit({ id: true });
export const updateCampaignSchema = insertCampaignSchema
  .partial()
  .required({ id: true });
export const upsertCampaignSchema = insertCampaignSchema.partial({ id: true });
export const selectCampaignSchema = createSelectSchema(Campaigns);

export type Campaign = InferSelectModel<typeof Campaigns>;
export type InsertCampaign = InferInsertModel<typeof Campaigns>;
export type CreateCampaign = z.infer<typeof createCampaignSchema>;
export type UpdateCampaign = z.infer<typeof updateCampaignSchema>;
export type UpsertCampaign = z.infer<typeof upsertCampaignSchema>;
export type SelectCampaign = z.infer<typeof selectCampaignSchema>;

// queries

export interface CampaignWithTeamAndTrack extends Campaign {
  workspace: Workspace;
  track: Track;
}

export interface CampaignWithWorkspaceAndTrackAndGenres extends Campaign {
  workspace: Workspace;
  track: Track & { genres: Genre[] };
}

export interface CampaignWithTrackAndGenres extends Campaign {
  track: Track & { genres: Genre[] };
}

//  forms

export const createUserAndPlaylistPitchCampaignSchema = z.object({
  user: newUserContactInfoSchemaWithRole,
  track: createTrackSchema.partial({ workspaceId: true }),
  artist: createWorkspaceSchema
    .required({
      spotifyArtistId: true,
    })
    .partial({ handle: true }),
});

export const createPlaylistPitchCampaignSchema = z.object({
  track: upsertTrackSchema.partial({
    workspaceId: true,
  }),
  artist: upsertWorkspaceSchema
    .required({
      spotifyArtistId: true,
    })
    .partial({
      handle: true,
    }),
});

const playlistPitchGenresSchema = z
  .array(
    insertGenreSchema.extend({
      totalPlaylists: z.number().optional(),
      totalPitchReviewers: z.number().optional(),
    }),
  )
  .refine(async (g) => {
    if (!g.length) return false;

    // sort genres alphabetically so any order of a specific combination will be cached the same
    g.sort((a, b) => a.name.localeCompare(b.name));

    const { totalCurators } = await getTotalPlaylistReachByGenres_SA(
      g.map((g) => g.id),
    );

    return totalCurators > playlistPitchSettings.minCuratorReach;
  }, "More curators plz");

export const updatePlaylistPitchCampaign_ScreeningSchema = z.object({
  id: updateCampaignSchema.shape.id,
  genres: playlistPitchGenresSchema,
  stage: updateCampaignSchema.shape.stage
    .unwrap()
    .extract(["approved", "rejected"]),
  screeningMessage: z.string().min(15, "Must be at least 15 characters"),
});

export type UpdatePlaylistPitchCampaign_ScreeningSchema = z.infer<
  typeof updatePlaylistPitchCampaign_ScreeningSchema
>;

export const updatePlaylistPitchCampaign_LaunchSchema = z.object({
  id: updateCampaignSchema.shape.id,
  genres: playlistPitchGenresSchema,
  reach: z.number().min(playlistPitchSettings.minCuratorReach),
});

export type UpdatePlaylistPitchCampaign_LaunchSchema = z.infer<
  typeof updatePlaylistPitchCampaign_LaunchSchema
>;
