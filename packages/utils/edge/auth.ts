import { User, prisma } from '@barely/db';
interface CreateLoginTokenProps {
	user: User;
}
export async function createLoginToken({ user }: CreateLoginTokenProps) {
	const token = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

	const loginToken = await prisma.loginToken.create({
		data: {
			token,
			expiresAt,
			user: {
				connect: {
					id: user.id,
				},
			},
		},
	});
}
