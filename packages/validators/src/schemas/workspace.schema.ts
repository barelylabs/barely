import type { InferSelectModel } from 'drizzle-orm';
import { Workspaces } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

export const insertWorkspaceSchema = createInsertSchema(Workspaces, {
	name: z.string().min(3, 'Your workspace name must be at least 3 characters long'),
	handle: z
		.string()
		.min(3, 'Your workspace handle must be at least 3 characters long')
		.max(32, 'Your workspace handle must be no more than 32 characters long')
		.regex(
			/^[a-zA-Z][a-zA-Z0-9-_]*$/,
			'Your workspace handle must start with a letter and can only contain letters, numbers, dashes, and underscores',
		),
	spotifyFollowers: z.coerce.number().min(0).nullish(),
	spotifyMonthlyListeners: z.coerce.number().min(0).nullish(),
	youtubeSubscribers: z.coerce.number().min(0).nullish(),
	tiktokFollowers: z.coerce.number().min(0).nullish(),
	instagramFollowers: z.coerce.number().min(0).nullish(),
	twitterFollowers: z.coerce.number().min(0).nullish(),
	facebookFollowers: z.coerce.number().min(0).nullish(),
});
export const createWorkspaceSchema = insertWorkspaceSchema.omit({ id: true });

export const updateWorkspaceSchema = insertWorkspaceSchema
	.partial()
	.required({ id: true });

export const updateCurrentWorkspaceSchema = updateWorkspaceSchema.omit({
	id: true,
});

export const upsertWorkspaceSchema = insertWorkspaceSchema.partial({
	id: true,
});
export const selectWorkspaceSchema = createSelectSchema(Workspaces);

export type Workspace = InferSelectModel<typeof Workspaces>;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type CreateWorkspace = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspace = z.infer<typeof updateWorkspaceSchema>;
export type UpsertWorkspace = z.infer<typeof upsertWorkspaceSchema>;
export type SelectWorkspace = z.infer<typeof selectWorkspaceSchema>;

// forms
export const workspaceTypeSchema = insertWorkspaceSchema.shape.type.unwrap();

// public
export const publicWorkspaceSchema = selectWorkspaceSchema
	.pick({
		// id: true,
		name: true,
		handle: true,
		brandHue: true,
		brandAccentHue: true,
		type: true,
		bio: true,
		bookingTitle: true,
		bookingName: true,
		bookingEmail: true,
		// social ids
		spotifyArtistId: true,
		youtubeChannelId: true,
		tiktokUsername: true,
		instagramUsername: true,
		// stats
		spotifyFollowers: true,
		spotifyMonthlyListeners: true,
		youtubeSubscribers: true,
		tiktokFollowers: true,
		instagramFollowers: true,
		twitterFollowers: true,
		facebookFollowers: true,
		// stripe
		stripeConnectAccountId: true,
		stripeConnectAccountId_devMode: true,
	})
	.extend({
		// avatarImageUrl: z.string().nullish(),
		avatarImageS3Key: z.string().nullish(),
		avatarImageBlurHash: z.string().nullish(),
		// headerImageUrl: z.string().nullish(),
		headerImageS3Key: z.string().nullish(),
		headerImageBlurHash: z.string().nullish(),
	});

export type PublicWorkspace = z.infer<typeof publicWorkspaceSchema>;

export interface PublicWorkspaceWithStripe extends PublicWorkspace {
	stripeConnectAccountId: string | null;
	stripeConnectAccountId_devMode: string | null;
}

// type WorkspaceForPublicWorkspace = PublicWorkspace & Partial<Workspace>;

export function getPublicWorkspaceFromWorkspace(
	workspace: PublicWorkspace & Partial<Workspace>,
): PublicWorkspace {
	return {
		name: workspace.name,
		handle: workspace.handle,
		type: workspace.type,

		brandHue: workspace.brandHue,
		brandAccentHue: workspace.brandAccentHue,

		bio: workspace.bio,
		bookingTitle: workspace.bookingTitle,
		bookingName: workspace.bookingName,
		bookingEmail: workspace.bookingEmail,
		spotifyArtistId: workspace.spotifyArtistId,
		youtubeChannelId: workspace.youtubeChannelId,
		tiktokUsername: workspace.tiktokUsername,
		instagramUsername: workspace.instagramUsername,
		spotifyFollowers: workspace.spotifyFollowers,
		spotifyMonthlyListeners: workspace.spotifyMonthlyListeners,
		youtubeSubscribers: workspace.youtubeSubscribers,
		tiktokFollowers: workspace.tiktokFollowers,
		instagramFollowers: workspace.instagramFollowers,
		twitterFollowers: workspace.twitterFollowers,
		facebookFollowers: workspace.facebookFollowers,

		stripeConnectAccountId: workspace.stripeConnectAccountId,
		stripeConnectAccountId_devMode: workspace.stripeConnectAccountId_devMode,
	};
}

// assets
export const workspaceAssetsSchema = z.object({
	// handle: z.string(),
	types: z.array(z.enum(['cartFunnel', 'pressKit', 'landingPage'])).optional(),
	search: z.string().optional(),
});
