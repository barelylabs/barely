import { z } from 'zod';

import { campaignBaseSchema } from '../db/campaign';
import { artistBaseSchema } from '../db/artist';
import { artistUserRoleBaseSchema } from '../db/artistuserrole';
import { trackBaseSchema } from '../db/track';

export const createCampaignFormSchema = z.object({
	type: campaignBaseSchema.shape.type,
	user: z.union([
		z.object({
			id: z.string(),
			firstName: z.string().min(2).optional(),
			lastName: z.string().min(2).optional(),
			email: z.string().email().optional(),
			phone: z.string().optional(),
		}),
		z.object({
			firstName: z
				.string()
				.min(2, { message: 'First name must be at least 2 characters' }),
			lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
			email: z.string().email({ message: 'A valid email is required' }),
			phone: z.string().optional(),
		}),
	]),
	artist: z.object({
		id: artistBaseSchema.shape.id.optional(),
		name: z.string().min(2, { message: 'Artist name must be at least 2 characters' }),
		handle: artistBaseSchema.shape.handle
			.min(2, { message: 'Artist handle must be at least 2 characters' })
			.optional(),
		spotifyId: artistBaseSchema.shape.spotifyId.unwrap(),
		role: artistUserRoleBaseSchema.shape.role,
	}),

	track: z.discriminatedUnion('released', [
		z.object({
			id: trackBaseSchema.shape.id.optional(),
			released: z.literal(true),
			releaseDate: trackBaseSchema.shape.releaseDate.unwrap().optional(),
			name: trackBaseSchema.shape.name,
			spotifyId: trackBaseSchema.shape.spotifyId,
		}),
		z.object({
			id: trackBaseSchema.shape.id.optional(),
			released: z.literal(false),
			releaseDate: trackBaseSchema.shape.releaseDate.unwrap(),
			name: trackBaseSchema.shape.name,
			spotifyId: trackBaseSchema.shape.spotifyId,
			// todo - figure out how upload track or use soundcloud link, etc.
		}),
	]),
});
