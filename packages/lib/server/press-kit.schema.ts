import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import type { FileRecord, PublicImage } from './file.schema';
import type { PublicMixtapeWith_Tracks } from './mixtape.schema';
import type { PublicWorkspace } from './routes/workspace/workspace.schema';
import { z_optUrl } from '../utils/zod-helpers';
import { PressKits } from './press-kit.sql';
import { updateCurrentWorkspaceSchema } from './routes/workspace/workspace.schema';

export const insertPressKitVideos = z.array(
	z.object({
		title: z.string().optional(),
		url: z.string().url(),
		description: z.string().optional(),
	}),
);

export const insertPressKitSchema = createInsertSchema(PressKits, {
	pressQuotes: z.array(
		z.object({
			quote: z.string(),
			source: z.string(),
			link: z_optUrl,
		}),
	),
	videos: insertPressKitVideos,
}).extend({
	_workspace: updateCurrentWorkspaceSchema
		.pick({
			bio: true,
			bookingTitle: true,
			bookingName: true,
			bookingEmail: true,
		})
		.optional(),
	_pressPhotos: z
		.array(
			z.object({
				fileId: z.string(),
				lexorank: z.string(),
			}),
		)
		.optional(),
});

export const createPressKitSchema = insertPressKitSchema.omit({
	id: true,
	workspaceId: true,
	handle: true,
});
export const updatePressKitSchema = insertPressKitSchema
	.partial({
		workspaceId: true,
		handle: true,
	})
	.required({ id: true });
export const upsertPressKitSchema = insertPressKitSchema.partial({
	id: true,
	workspaceId: true,
	handle: true,
});
export const selectPressKitSchema = createSelectSchema(PressKits);

export type InsertPressKit = z.infer<typeof insertPressKitSchema>;
export type CreatePressKit = z.infer<typeof createPressKitSchema>;
export type UpdatePressKit = z.infer<typeof updatePressKitSchema>;
export type UpsertPressKit = z.infer<typeof upsertPressKitSchema>;
export type PressKit = InferSelectModel<typeof PressKits>;

interface NormalizedPressPhoto {
	file: FileRecord;
	lexorank: string;
}

export type NormalizedPressKit = PressKit & {
	pressPhotos: NormalizedPressPhoto[];
};

// form
export const defaultPressKit: UpsertPressKit = {
	bio: '',
	overrideWorkspaceBio: false,
	showBio: false,
	showVideos: false,
	videos: [],
	// press quotes
	showPressQuotes: false,
	pressQuotes: [],
	showPressPhotos: false,
	showBooking: false,
	// social links
	showSocialLinks: false,
	showFacebookLink: true,
	showInstagramLink: true,
	showSpotifyLink: true,
	showTiktokLink: true,
	showXLink: true,
	showYoutubeLink: true,
	// social stats
	showSocialStats: false,
	showSpotifyFollowers: false,
	showSpotifyMonthlyListeners: false,
	showYoutubeSubscribers: false,
	showTiktokFollowers: false,
	showInstagramFollowers: false,
	showXFollowers: false,
	showFacebookFollowers: false,
};

// public
export interface PublicPressPhoto extends PublicImage {
	lexorank: string;
}

export interface PublicPressKit extends PressKit {
	pressPhotos: PublicPressPhoto[];
	workspace: PublicWorkspace;
	mixtape?: PublicMixtapeWith_Tracks;
}
