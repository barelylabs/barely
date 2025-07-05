import type { NeonPool } from '@barely/db/pool';
import { dbPool } from '@barely/db/pool';
import { Users } from '@barely/db/sql';
import { eq } from 'drizzle-orm';
import * as r from 'remeda';

const getGenresByUserId = async (userId: string, pool: NeonPool) => {
	const userWithGenres = await dbPool(pool).query.Users.findFirst({
		where: eq(Users.id, userId),
		with: {
			_workspaces: {
				with: {
					workspace: {
						with: {
							playlists: {
								with: {
									_genres: {
										with: {
											genre: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});

	if (!userWithGenres) {
		throw new Error('User not found');
	}

	const genres = userWithGenres._workspaces
		.map(userToWorkspace => userToWorkspace.workspace.playlists)
		.flat()
		.map(playlist => playlist._genres.map(_g => _g.genre))
		.flat();

	return r.uniq(genres);
};

export { getGenresByUserId };
