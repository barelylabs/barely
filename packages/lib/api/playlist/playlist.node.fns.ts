import { inferAsyncReturnType, TRPCError } from '@trpc/server';
import { Configuration, OpenAIApi } from 'openai';

import { prisma } from '@barely/db';

import env from '../../env';
import { getSpotifyPlaylistTracks } from '../spotify/spotify.endpts.playlist';
import { getSpotifyAccessToken } from '../spotify/spotify.node.fns';

const configuration = new Configuration({
	apiKey: env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const getPlaylistsByUserId = async (userId: string) => {
	const playlists = await prisma.playlist.findMany({
		where: {
			OR: [
				{
					team: {
						members: {
							some: {
								userId,
							},
						},
					},
				},
				{
					spotifyAccount: {
						user: {
							id: userId,
						},
					},
				},
			],
		},
		include: {
			spotifyAccount: {
				select: {
					id: true,
					username: true,
				},
			},
		},
	});

	return playlists;
};

const userGetPlaylistById = async (props: { playlistId: string; userId: string }) => {
	const { playlistId, userId } = props;

	console.log('userId => ', userId);
	console.log('playlistId => ', playlistId);

	// find where playlist id matches and where either user is a member of the team or the user is the owner of the playlist
	const playlist = await prisma.playlist.findFirst({
		where: {
			id: playlistId,
			OR: [
				{
					team: {
						members: {
							some: {
								userId,
							},
						},
					},
				},
				{
					spotifyAccount: {
						user: {
							id: userId,
						},
					},
				},
			],
		},
		include: {
			spotifyAccount: {
				select: {
					id: true,
					providerAccountId: true,
					username: true,
				},
			},
			team: true,
			playlistGenres: {
				select: { genreName: true },
			},
		},
	});

	return playlist;
};

const totalPlaylistReachByGenres = async (genreNames: string[]) => {
	const distinctPlaylists = await prisma.playlistGenre.findMany({
		where: {
			genreName: { in: genreNames },
			playlist: {
				spotifyAccount: { user: { pitchReviewing: true } },
			},
		},
		distinct: ['playlistId'],
		select: {
			playlist: { select: { id: true, spotifyAccount: { select: { userId: true } } } },
		},
	});

	const totalCurators = new Set(
		distinctPlaylists.map(playlist => playlist.playlist.spotifyAccount?.userId),
	).size;

	return { distinctPlaylists, totalPlaylists: distinctPlaylists.length, totalCurators };
};

const estimateGenresByPlaylistId = async ({ playlistId }: { playlistId: string }) => {
	const playlist = await prisma.playlist.findUnique({
		where: {
			id: playlistId,
		},
		include: {
			spotifyAccount: true,
		},
	});

	if (!playlist?.spotifyId)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Spotify playlist not found',
		});
	if (!playlist?.spotifyAccount)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'No Spotify account associated with that playlist.',
		});

	console.log('asking gpt for genres');

	const spotifyAccount = await prisma.account.findUnique({
		where: {
			id: playlist.spotifyAccount.id,
		},
	});

	if (!spotifyAccount?.providerAccountId) {
		throw new Error('No spotify account found');
	}

	const spotifyAccessToken = await getSpotifyAccessToken(spotifyAccount);

	const rawTracks = await getSpotifyPlaylistTracks({
		spotifyId: playlist.spotifyId,
		accessToken: spotifyAccessToken,
		limit: 50,
	});

	const tracks = rawTracks.map(item => ({
		track: item.track.name,
		artist: item.track.artists[0]?.name ?? 'unknown',
	}));

	console.log('tracks => ', tracks);

	// convert tracklist to string
	const tracklist = tracks
		.map(track => `'${track.track}' by '${track.artist}'`)
		.join('/n');

	const completion = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'system',
				content: `You are a sophisticated music critic that can identify the genres of a playlist. The user will enter a list of songs and artists (in the format 'Song' by 'Artist') separated by a newline. You will respond with the top 15 genres/subgenres that best fit that playlist. Please respond with a maximum of 15 genres and separate each genre with a newline.`,
			},
			{
				role: 'user',
				content:
					"'Off My Mind' by 'Proper Youth'/n'Get High' by 'Hillsburn'/n'All Bottled Up' by 'John Mason'/n'Blind for You' by 'Alec Baker'/n'Anyway' by 'Nosila'/n'Creature of the Night' by 'Long Tonic'/n'Mama Raised You Right' by 'Bad Flamingo'",
			},
			{
				role: 'assistant',
				content:
					'Indie Rock/nAlternative Rock/nCountry Rock/nPop Rock/nAmericana/nSinger-songwriter/nFolk Rock/nIndie Folk/nFolk/nPsychedelic Rock/nDream Pop/nAcoustic Rock/nIndie Pop/nPop/nSoft Rock/nSadcore',
			},
			{
				role: 'user',
				content:
					'You responded with 16 genres, but you should only respond with 15. Please try again.',
			},
			{
				role: 'assistant',
				content:
					'Indie Rock/nAlternative Rock/nCountry Rock/nPop Rock/nAmericana/nSinger-songwriter/nFolk Rock/nIndie Folk/nFolk/nPsychedelic Rock/nDream Pop/nAcoustic Rock/nIndie Pop/nPop/nSoft Rock',
			},
			{
				role: 'user',
				content: tracklist,
			},
		],
	});

	console.log(
		'chatgpt response => ',
		completion.data.choices[0]?.message?.content.replace(/^\n+/, '').split(','),
	);

	if (
		!completion.data.choices[0]?.message?.content ||
		completion.data.choices[0]?.message?.content === `I don't know.`
	) {
		return [];
	}

	// remove any extra spaces at the beginning of the string. split by newline and remove any extra spaces or punctuation at the beginning or end of each genre.
	const genres = completion.data.choices[0]?.message?.content
		.replace(/^\n+/, '')
		.split('/n')
		// remove any extra spaces or punctuation at the beginning or end of each genre
		.map(genre => genre.trim().replace(/^[.,/#!$%^&*;:{}=\-_`~()]/g, ''));

	return genres;
};

type GetPlaylistsByUserId = inferAsyncReturnType<typeof getPlaylistsByUserId>;
type UserGetPlaylistById = inferAsyncReturnType<typeof userGetPlaylistById>;
type TotalPlaylistReach = inferAsyncReturnType<typeof totalPlaylistReachByGenres>;

export {
	getPlaylistsByUserId,
	type GetPlaylistsByUserId,
	userGetPlaylistById,
	type UserGetPlaylistById,
	estimateGenresByPlaylistId,
	totalPlaylistReachByGenres,
	type TotalPlaylistReach,
};
