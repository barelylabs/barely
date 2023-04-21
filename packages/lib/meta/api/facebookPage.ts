import { z } from 'zod';

import { zGet } from '../../utils/edge/zod-axios';

interface FacebookPagesByUserProps {
	facebookUserId: string;
}

export function byUser({ facebookUserId }: FacebookPagesByUserProps) {
	const accounts = zGet({
		endpoint: `https://graph.facebook.com/v15.0/${facebookUserId}/accounts`,
		schema: fbPagesResponseSchema,
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
