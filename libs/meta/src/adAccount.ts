import { z } from 'zod';
import { zFetch } from '@barely/utils/edge';

interface AdAccountsByUserProps {
	facebookUserAccessToken: string;
}

export async function byUser({ facebookUserAccessToken }: AdAccountsByUserProps) {
	const adAccountsRes = await zFetch.get({
		endpoint: `https://graph.facebook.com/v15.0/me?fields=adaccounts{name,business_name,account_id}&access_token=${facebookUserAccessToken}`,
		schemaRes: metaAdAccountsResponseSchema,
	});
	console.log('adAccounts', adAccountsRes);

	const adAccounts = adAccountsRes?.json?.adAccounts?.data;
	return adAccounts;
}

const metaAdAccountsResponseSchema = z.object({
	id: z.string(),
	adAccounts: z.object({
		data: z.array(
			z.object({
				account_id: z.string(),
				business_name: z.string(),
				name: z.string(),
			}),
		),
		paging: z.object({
			cursors: z.object({
				after: z.string(),
				before: z.string(),
			}),
		}),
	}),
});
