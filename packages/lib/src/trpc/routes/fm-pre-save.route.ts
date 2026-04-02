import { dbHttp } from '@barely/db/client';
import { Fans } from '@barely/db/sql/fan.sql';
import { FmPages } from '@barely/db/sql/fm.sql';
import { SpotifyPreSaves } from '@barely/db/sql/spotify-pre-save.sql';
import { publicProcedure } from '@barely/lib/trpc';
import { newId, raiseTRPCError } from '@barely/utils';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import {
	buildSpotifyAuthUrl,
	exchangeSpotifyCode,
	getFanSpotifyProfile,
} from '../../integrations/spotify/spotify.endpts.fan-oauth';

export const fmPreSaveRoute = {
	/**
	 * Get the Spotify authorization URL for pre-save.
	 * Called from the FM page when user clicks "Pre-save".
	 */
	getSpotifyAuthUrl: publicProcedure
		.input(
			z.object({
				fmPageId: z.string(),
				redirectUri: z.string(),
				returnPath: z.string(), // e.g. "handle/key" to redirect back after OAuth
			}),
		)
		.mutation(({ input }) => {
			// Encode fmPageId + returnPath in the state so we can recover them after OAuth
			const state = Buffer.from(
				JSON.stringify({
					fmPageId: input.fmPageId,
					returnPath: input.returnPath,
				}),
			).toString('base64url');

			const authUrl = buildSpotifyAuthUrl({
				redirectUri: input.redirectUri,
				state,
			});

			return { authUrl, state };
		}),

	/**
	 * Complete the pre-save after Spotify OAuth callback.
	 * Exchanges the code for tokens, fetches profile, creates Fan + PreSave records.
	 */
	createPreSave: publicProcedure
		.input(
			z.object({
				fmPageId: z.string(),
				code: z.string(),
				redirectUri: z.string(),
				email: z.string().optional(),
				fullName: z.string().optional(),
				emailMarketingOptIn: z.boolean().default(false),
				timezone: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			// 1. Get the FM page with its track and workspace
			const fmPage =
				(await dbHttp.query.FmPages.findFirst({
					where: eq(FmPages.id, input.fmPageId),
					with: {
						workspace: { columns: { id: true } },
						track: { columns: { id: true, spotifyId: true, released: true } },
					},
				})) ?? raiseTRPCError({ message: 'FM page not found' });

			if (!fmPage.track) {
				return raiseTRPCError({
					message: 'This FM page is not configured for pre-saves',
				});
			}

			if (fmPage.track.released) {
				return raiseTRPCError({
					message: 'This track has already been released',
				});
			}

			// 2. Exchange the authorization code for tokens
			const tokens = await exchangeSpotifyCode({
				code: input.code,
				redirectUri: input.redirectUri,
			});

			// 3. Get the fan's Spotify profile
			const profile = await getFanSpotifyProfile(tokens.access_token);

			const fanEmail = input.email ?? profile.email;
			const fanName = input.fullName ?? profile.displayName;

			// 4. Find or create the Fan record
			let fanId: string | null = null;
			if (fanEmail) {
				const existingFan = await dbHttp.query.Fans.findFirst({
					where: and(eq(Fans.email, fanEmail), eq(Fans.workspaceId, fmPage.workspace.id)),
				});

				if (existingFan) {
					fanId = existingFan.id;
					// Update marketing opt-in if they opted in this time
					if (input.emailMarketingOptIn && !existingFan.emailMarketingOptIn) {
						await dbHttp
							.update(Fans)
							.set({ emailMarketingOptIn: true })
							.where(eq(Fans.id, existingFan.id));
					}
				} else {
					fanId = newId('fan');
					await dbHttp.insert(Fans).values({
						id: fanId,
						workspaceId: fmPage.workspace.id,
						email: fanEmail,
						fullName: fanName ?? fanEmail,
						emailMarketingOptIn: input.emailMarketingOptIn,
						appReferer: 'fm' as const,
					});
				}
			}

			// 5. Check for existing pre-save (same Spotify account + track)
			const existingPreSave = await dbHttp.query.SpotifyPreSaves.findFirst({
				where: and(
					eq(SpotifyPreSaves.spotifyAccountId, profile.id),
					eq(SpotifyPreSaves.trackId, fmPage.track.id),
				),
			});

			if (existingPreSave) {
				// Update tokens (they may have been refreshed)
				await dbHttp
					.update(SpotifyPreSaves)
					.set({
						spotifyAccessToken: tokens.access_token,
						spotifyRefreshToken:
							tokens.refresh_token ?? existingPreSave.spotifyRefreshToken,
						spotifyTokenExpiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
						spotifyTokenScope: tokens.scope,
						fanId: fanId ?? existingPreSave.fanId,
					})
					.where(eq(SpotifyPreSaves.id, existingPreSave.id));

				return { success: true, alreadyPreSaved: true };
			}

			// 6. Create the pre-save record
			if (!tokens.refresh_token) {
				return raiseTRPCError({
					message: 'Spotify did not provide a refresh token. Please try again.',
				});
			}

			await dbHttp.insert(SpotifyPreSaves).values({
				id: newId('spotifyPreSave'),
				workspaceId: fmPage.workspace.id,
				trackId: fmPage.track.id,
				fmPageId: fmPage.id,
				fanId,
				spotifyAccountId: profile.id,
				spotifyEmail: profile.email,
				spotifyAccessToken: tokens.access_token,
				spotifyRefreshToken: tokens.refresh_token,
				spotifyTokenExpiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
				spotifyTokenScope: tokens.scope,
				emailMarketingOptIn: input.emailMarketingOptIn,
				timezone: input.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
			});

			return { success: true, alreadyPreSaved: false };
		}),
};
