import { z } from 'zod';

const accountPlatformSchema = z.enum([
	'discord',
	'facebook',
	'facebookPage',
	'github',
	'google',
	'metaAd',
	'metaBusiness',
	'spotify',
	'tiktok',
	'twitch',
	'twitter',
	'whatsapp',
]);

const oAuthProviderSchema = z.enum([
	'discord',
	'facebook',
	'google',
	'spotify',
	'tiktok',
]);

export { accountPlatformSchema, oAuthProviderSchema };
