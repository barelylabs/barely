import { z } from 'zod';

export const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	NEXTAUTH_URL: z.string().min(1),
	NEXTAUTH_SECRET: z.string().min(1),

	API_USER_ID: z.string().min(1),

	DISCORD_CLIENT_ID: z.string().min(1),
	DISCORD_CLIENT_SECRET: z.string().min(1),

	SPOTIFY_CLIENT_ID: z.string().min(1),
	SPOTIFY_CLIENT_SECRET: z.string().min(1),

	PROPERYOUTH_META_PIXEL_ID: z.string().min(1),
	PROPERYOUTH_META_PIXEL_ACCESS_TOKEN: z.string().min(1),

	TWILIO_ACCOUNT_SID: z.string().min(1),
	TWILIO_AUTH_TOKEN: z.string().min(1),
	TWILIO_PHONE_NUMBER: z.string().min(1),

	VISITOR_IP: z.string().min(1),
	VISITOR_UA: z.string().min(1),
});
