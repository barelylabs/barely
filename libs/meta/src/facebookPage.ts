import { z } from 'zod';
import { zFetch } from '@barely/utils/edge';

interface FacebookPagesByUserProps {
	facebookUserId: string;
}

export function byUser({ facebookUserId }: FacebookPagesByUserProps) {
	const accounts = zFetch.get({
		endpoint: `https://graph.facebook.com/v15.0/${facebookUserId}/accounts`,
		schemaRes: fbPagesResponseSchema,
	});
	return accounts;
}

const fbPagesResponseSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		access_token: z.string(),
	}),
);
