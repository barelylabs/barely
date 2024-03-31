import { z } from 'zod';

import { zGet } from '../../utils/zod-fetch';

interface AdAccountsByUserProps {
	facebookUserAccessToken: string;
}

export async function byUser({ facebookUserAccessToken }: AdAccountsByUserProps) {
	const adAccountsRes = await zGet(
		`https://graph.facebook.com/v15.0/me?fields=adaccounts{name,business_name,account_id}&access_token=${facebookUserAccessToken}`,
		metaAdAccountsResponseSchema,
	);
	console.log('adAccounts', adAccountsRes);

	// const adAccounts = adAccountsRes?.json?.adAccounts?.data;

	if (!adAccountsRes?.success) {
		throw new Error('adAccountsRes not successful');
	}

	if (!adAccountsRes?.parsed) {
		throw new Error('adAccountsRes not successful');
	}

	return adAccountsRes.data.adAccounts.data;
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
