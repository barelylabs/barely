import { z } from 'zod';

import { genreOptionSchema } from '../genre/genre.schema';
import { teamSchema } from '../team/team.schema';
import { trackSchema } from '../track/track.schema';
import { userContactInfoSchema } from '../user/user.schema';

const campaignTypeSchema = z.enum([
	'playlistPitch',
	'fbSpark',
	'igSpark',
	'tiktokSpark',
	'playlistSpark',
	'gigSpark',
	'fbCharge',
	'igCharge',
	'spotifyCharge',
]);

const campaignStageSchema = z.enum([
	'screening',
	'rejected',
	'approved',
	'queuedForTesting',
	'errorInTestingQueue',
	'testing',
	'testingComplete',
	'running',
	'paused',
	'complete',
]);

const campaignSchema = z.object({
	id: z.string(),
	type: campaignTypeSchema,
	stage: campaignStageSchema,
	endDate: z.date().optional(),
	createdById: z.string(),
	trackId: z.string().optional(),
	playlistId: z.string().optional(),
	screeningMessage: z.string().optional(),
	curatorReach: z.number().optional(),
});

const campaignUpdateSchema = campaignSchema.partial().required({ id: true });

const newUserCreatePlaylistPitchSchema = z.object({
	user: userContactInfoSchema,
	track: trackSchema.partial({ id: true, teamId: true }),
	artist: teamSchema.partial({ id: true, handle: true }),
});
type NewUserCreatePlaylistPitch = z.infer<typeof newUserCreatePlaylistPitchSchema>;

const existingUserCreatePlaylistPitchSchema = newUserCreatePlaylistPitchSchema.omit({
	user: true,
});
type ExistingUserCreatePlaylistPitch = z.infer<
	typeof existingUserCreatePlaylistPitchSchema
>;

const campaignPlaylistPitchScreeningSchema = z.object({
	campaignId: z.string(),
	genres: z.array(genreOptionSchema),
	stage: campaignStageSchema.extract(['approved', 'rejected']),
	screeningMessage: z.string(),
});

type CampaignUpdateSchema = z.infer<typeof campaignUpdateSchema>;

export {
	campaignTypeSchema,
	campaignStageSchema,
	campaignSchema,
	campaignUpdateSchema,
	type CampaignUpdateSchema,
	// playlist.pitch
	newUserCreatePlaylistPitchSchema,
	type NewUserCreatePlaylistPitch,
	existingUserCreatePlaylistPitchSchema,
	type ExistingUserCreatePlaylistPitch,
	campaignPlaylistPitchScreeningSchema,
};
