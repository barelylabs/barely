import { z } from 'zod';

import { userBaseSchema } from '../db/user';
import { trackBaseSchema } from '../db/track';
import { artistBaseSchema } from '../db/artist';
import { artistUserRoleBaseSchema } from '../db/artistuserrole';
import { campaignBaseSchema } from '../db/campaign';

export const createCampaign = z.object({
	type: campaignBaseSchema.shape.type,
	user: z.union([
		z.object({ id: z.string() }),
		z.object({
			firstName: userBaseSchema.shape.firstName.unwrap(),
			lastName: userBaseSchema.shape.lastName.unwrap(),
			email: userBaseSchema.shape.email.unwrap(),
			phone: userBaseSchema.shape.phone,
		}),
	]),
	artist: z.union([
		z.object({ id: z.string() }),
		z.object({
			name: artistBaseSchema.shape.name,
			spotifyId: artistBaseSchema.shape.spotifyId,
			role: artistUserRoleBaseSchema.shape.role,
		}),
	]),
	track: z.union([
		z.object({ id: z.string() }),
		z.discriminatedUnion('released', [
			z.object({
				released: z.literal(true),
				name: trackBaseSchema.shape.name,
				spotifyId: trackBaseSchema.shape.spotifyId,
			}),
			z.object({
				released: z.literal(false),
				name: trackBaseSchema.shape.name,
				// todo - figure out how upload track or use soundcloud link, etc.
			}),
		]),
	]),
});
