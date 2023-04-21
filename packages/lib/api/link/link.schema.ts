import { z } from 'zod';

const analyticsPlatformSchema = z.enum(['meta', 'google', 'tiktok', 'snapchat']);

const analyticsEndpointSchema = z.object({
	id: z.string(),
	teamId: z.string(),
	platform: analyticsPlatformSchema,
	accessToken: z.string().nullable(),
});

const linkDomainSchema = z.enum(['barely', 'brl']);

const appTypeSchema = z.enum([
	'appleMusic',
	'email',
	'facebook',
	'instagram',
	'patreon',
	'snapchat',
	'spotify',
	'tiktok',
	'twitch',
	'twitter',
	'web',
	'whatsapp',
	'youtube',
]);

const linkSchema = z.object({
	id: z.string(),
	createdAt: z.date().optional(),
	teamId: z.string(),
	socialForTeamId: z.string(),
	showSocialForTeam: z.boolean(),
	handle: z.string(),
	domain: linkDomainSchema,
	slug: z.string().optional(),
	app: appTypeSchema,
	appRoute: z.string().optional(),
	appId: z.string().optional(),
	url: z.string(),
	appleSchema: z.string().optional(),
	androidSchema: z.string().optional(),
	ogTitle: z.string().optional(),
	ogDescription: z.string().optional(),
	ogImage: z.string().optional(),
	favicon: z.string().optional(),
	qrLight: z.string().optional(),
	qrDark: z.string().optional(),
	qrText: z.string().optional(),
	qrLogo: z.string().optional(),
	bioId: z.string().optional(),
	appLinkId: z.string().optional(),
	delete: z.boolean().optional(),
});

const linkWithRemarketingSchema = linkSchema
	.extend({
		remarketingEndpoints: z.array(analyticsEndpointSchema),
	})
	.partial();

type LinkWithRemarketing = z.infer<typeof linkWithRemarketingSchema>;

export {
	linkDomainSchema,
	appTypeSchema,
	linkSchema,
	linkWithRemarketingSchema,
	type LinkWithRemarketing,
};
