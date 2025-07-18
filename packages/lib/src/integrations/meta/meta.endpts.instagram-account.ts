import { zGet } from '@barely/utils';
import { z } from 'zod/v4';

interface InstagramAccountsByFacebookPageProps {
	facebookPageId: string;
}

export function byFacebookPage({ facebookPageId }: InstagramAccountsByFacebookPageProps) {
	const accounts = zGet(
		`https://graph.facebook.com/v15.0/${facebookPageId}?fields=instagram_accounts{username,follow_count,followed_by_count,has_profile_picture,profile_pic}`,
		fbPageInstagramAccountsResponse,
	);
	return accounts;
}

const fbPageInstagramAccountsResponse = z.array(
	z.object({
		id: z.string(),
		follow_count: z.number(),
		followed_by_count: z.number(),
		has_profile_picture: z.boolean(),
		is_private: z.boolean(),
		is_published: z.boolean(),
		media_count: z.number(),
		profile_pic: z.string(),
		username: z.string(),
	}),
);
