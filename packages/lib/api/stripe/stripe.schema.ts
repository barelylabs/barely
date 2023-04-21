import { z } from 'zod';

const stripeCampaignMetadataSchema = z.object({
	userId: z.string(),
	campaignId: z.string(),
});

const stripePitchCampaignMetadataSchema = stripeCampaignMetadataSchema.extend({
	trackName: z.string(),
	curatorReach: z.string(),
	estimatedPlaylistReach: z.string(),
});

type StripeCampaignMetadata = z.infer<typeof stripeCampaignMetadataSchema>;
type StripePitchCampaignMetadata = z.infer<typeof stripePitchCampaignMetadataSchema>;

export {
	stripeCampaignMetadataSchema,
	type StripeCampaignMetadata,
	stripePitchCampaignMetadataSchema,
	type StripePitchCampaignMetadata,
};
