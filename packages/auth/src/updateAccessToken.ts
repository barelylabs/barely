import { prisma } from '@barely/db';

interface UpdateAccessTokenProps {
	accountId: string;
	access_token: string;
	expires_at: number;
}

export const updateAccessToken = async ({
	accountId,
	access_token,
	expires_at,
}: UpdateAccessTokenProps) => {
	console.log('updating access token...');
	console.log('accountId => ', accountId);
	console.log('access_token => ', access_token);
	console.log('expires_at => ', expires_at);

	const account = await prisma.account.update({
		where: { id: accountId },
		data: {
			access_token,
			expires_at,
		},
	});

	return account;
};
