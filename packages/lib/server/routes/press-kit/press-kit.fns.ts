import { eq, or, sql } from 'drizzle-orm';

import type { PublicMixtapeWith_Tracks } from '../mixtape/mixtape.schema';
import type { PublicTrackWith_Artist_Files } from '../track/track.schema';
import type { PublicWorkspace } from '../workspace/workspace.schema';
import type { PublicPressKit, PublicPressPhoto } from './press-kit.schema';
import { db } from '../../db';
import { PressKits } from './press-kit.sql';

export async function getPublicPressKit({
	handle,
}: {
	handle: string;
}): Promise<PublicPressKit | null> {
	const preparedPublicPressKitQuery = db.http.query.PressKits.findFirst({
		where: eq(PressKits.handle, sql.placeholder('handle')),
		with: {
			workspace: {
				columns: {
					name: true,
					handle: true,
					type: true,
					bio: true,

					// booking
					bookingTitle: true,
					bookingName: true,
					bookingEmail: true,
					// social ids/links
					spotifyArtistId: true,
					youtubeChannelId: true,
					tiktokUsername: true,
					instagramUsername: true,
					// stats
					spotifyFollowers: true,
					spotifyMonthlyListeners: true,
					youtubeSubscribers: true,
					tiktokFollowers: true,
					instagramFollowers: true,
					twitterFollowers: true,
					facebookFollowers: true,
				},
				with: {
					_avatarImages: {
						where: _avatar => eq(_avatar.current, true),
						with: {
							file: {
								columns: {
									src: true,
								},
							},
						},
					},
					_headerImages: {
						where: _header => eq(_header.current, true),
						with: {
							file: {
								columns: {
									src: true,
								},
							},
						},
					},
				},
			},

			mixtape: {
				columns: {
					id: true,
					name: true,
					description: true,
				},
				with: {
					_tracks: {
						orderBy: (_t, { asc }) => [asc(_t.lexorank)], // prefer artwork
						columns: {
							lexorank: true,
						},
						with: {
							track: {
								columns: {
									id: true,
									name: true,
									isrc: true,
									releaseDate: true,
								},
								with: {
									_artworkFiles: {
										limit: 1,
										where: (_artworkFile, { eq }) => eq(_artworkFile.current, true),
										with: {
											file: {
												columns: {
													id: true,
													name: true,
													src: true,
													size: true,
													width: true,
													height: true,
												},
											},
										},
									},
									_audioFiles: {
										limit: 1,
										where: _audioFile =>
											or(
												eq(_audioFile.masterCompressed, true),
												eq(_audioFile.masterWav, true),
											),
										orderBy: (_audioFile, { desc }) => [
											desc(_audioFile.masterCompressed),
										], // prefer compressed
										with: {
											file: {
												columns: {
													id: true,
													name: true,
													src: true,
													size: true,
													duration: true,
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},

			_pressPhotos: {
				columns: {
					lexorank: true,
				},
				with: {
					file: {
						columns: {
							id: true,
							name: true,
							src: true,
							size: true,
							width: true,
							height: true,
						},
					},
				},
			},
		},
	}).prepare('getPublicPressKit');

	const publicPressKitData = await preparedPublicPressKitQuery.execute({
		handle,
	});

	if (!publicPressKitData) {
		return null;
	}
	/* normalize press kit */

	// normalize workspace
	const publicWorkspace: PublicWorkspace = {
		...publicPressKitData.workspace,
		avatarImageUrl: publicPressKitData.workspace._avatarImages[0]?.file.src,
		headerImageUrl: publicPressKitData.workspace._headerImages[0]?.file.src,
	};

	// normalize mixtape
	const publicTracks: (PublicTrackWith_Artist_Files & { lexorank: string })[] =
		publicPressKitData.mixtape?._tracks.map(_t => ({
			id: _t.track.id,
			name: _t.track.name,
			isrc: _t.track.isrc,
			releaseDate: _t.track.releaseDate,
			artworkUrl: _t.track._artworkFiles[0]?.file.src,
			audioUrl: _t.track._audioFiles[0]?.file.src,
			// normalized joins
			workspace: publicWorkspace,
			artwork: _t.track._artworkFiles[0]
				? {
						..._t.track._artworkFiles[0]?.file,

						width: _t.track._artworkFiles[0]?.file.width ?? 300,
						height: _t.track._artworkFiles[0]?.file.height ?? 300,
					}
				: undefined,
			audioFiles: _t.track._audioFiles.map(_f => ({
				id: _f.file.id,
				name: _f.file.name,
				src: _f.file.src,
				size: _f.file.size,
				// fixme: default to 60 seconds if duration is null. duration is set by the client on upload, but we should be proactive about fetching it if it's null.
				duration: _f.file.duration ?? 60,
			})),
			lexorank: _t.lexorank,
		})) ?? [];

	const publicMixtape: PublicMixtapeWith_Tracks | undefined =
		publicPressKitData.mixtape && publicTracks.length
			? {
					id: publicPressKitData.mixtape.id,
					name: publicPressKitData.mixtape.name,
					description: publicPressKitData.mixtape.description,
					tracks: publicTracks,
				}
			: undefined;

	// normalize press photos
	const publicPressPhotos: PublicPressPhoto[] = publicPressKitData._pressPhotos
		.filter(_p => _p.file.width && _p.file.height)
		.map(_p => {
			return {
				..._p.file,
				lexorank: _p.lexorank,
				// fixme: in theory, these will be set from the client on upload, but we might want to proactively fetch these if they're null.
				width: _p.file.width ?? 0,
				height: _p.file.height ?? 0,
			};
		});

	const publicPressKit: PublicPressKit = {
		...publicPressKitData,
		workspace: publicWorkspace,
		mixtape: publicMixtape,
		pressPhotos: publicPressPhotos,
	};

	return publicPressKit;
}
