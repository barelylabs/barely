import { eq } from 'drizzle-orm';
import * as r from 'remeda';

import { dbRead } from '../utils/db';
import { Db } from './db';
import { Users } from './user.sql';

const getGenresByUserId = async (userId: string, db: Db) => {
	const userWithGenres = await dbRead(db).query.Users.findFirst({
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
