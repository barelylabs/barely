import { prisma } from '@barely/db';

const getGenresByUserId = async (userId?: string) => {
	if (!userId) return [];

	const genres = await prisma.genre.findMany({
		where: {
			playlistGenres: {
				some: {
					playlist: {
						spotifyAccount: {
							userId,
						},
					},
				},
			},
		},
	});

	return genres;
};

export { getGenresByUserId };
