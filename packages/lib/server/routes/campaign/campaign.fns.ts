import { sendEmail } from '@barely/email';
import { PlaylistPitchConfirmEmailTemplate } from '@barely/email/src/templates/playlist-pitch/playlist-pitch-confirm';
import { PlaylistPitchToScreenEmailTemplate } from '@barely/email/src/templates/playlist-pitch/playlist-pitch-to-screen';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

import type { SessionUser } from '../../auth';
import type { Db } from '../../db';
import type {
	StripeLineItemMetadata,
	StripeTransactionMetadata,
} from '../../stripe/stripe.schema';
import type { User } from '../user/user.schema';
import type { Workspace } from '../workspace/workspace.schema';
import type {
	Campaign,
	CampaignWithTeamAndTrack,
	CampaignWithTrackAndGenres,
	CampaignWithWorkspaceAndTrackAndGenres,
	InsertCampaign,
} from './campaign.schema';
import { env } from '../../../env';
import { playlistPitchCostInDollars } from '../../../utils/campaign';
// import { APP_BASE_URL } from "../utils/constants";

import { newId } from '../../../utils/id';
import { getFullNameFromFirstAndLast } from '../../../utils/name';
import { sendText } from '../../../utils/sms';
import { sqlAnd } from '../../../utils/sql';
import { getAbsoluteUrl } from '../../../utils/url';
import { createLoginLink } from '../../auth/auth.fns';
import { dbHttp } from '../../db';
import { stripe } from '../../stripe';
import { totalPlaylistReachByGenres } from '../playlist/playlist.fns';
import { Tracks } from '../track/track.sql';
import { Users } from '../user/user.sql';
import { createStripeWorkspaceCustomer } from '../workspace-stripe/workspace-stripe.fns';
import { Campaigns } from './campaign.sql';

export async function createPitchCheckoutLink(props: {
	user: User;
	workspace: Workspace;
	campaign: CampaignWithWorkspaceAndTrackAndGenres;
}) {
	if (!props.campaign.curatorReach) {
		throw new Error('Campaign must have a defined curator reach.');
	}

	const workspace =
		props.workspace.stripeCustomerId ?
			props.workspace
		:	await createStripeWorkspaceCustomer({
				workspaceId: props.workspace.id,
				email: props.user.email,
				name:
					props.user.fullName ??
					getFullNameFromFirstAndLast(props.user.firstName, props.user.lastName),
				phone: props.user.phone ?? undefined,
			});

	if (!workspace.stripeCustomerId) {
		throw new Error('Workspace must have a stripeCustomerId.');
	}

	const successUrl = getAbsoluteUrl(
		'app',
		`${props.campaign.workspace.handle}/campaign/${props.campaign.id}?success=true`,
	);

	const cancelUrl = getAbsoluteUrl(
		'app',
		`${props.campaign.workspace.handle}/campaign/${props.campaign.id}/launch`,
	);

	const costInDollars = playlistPitchCostInDollars({
		curatorReach: props.campaign.curatorReach,
	});

	const { totalPlaylists, totalCurators } = await totalPlaylistReachByGenres(
		props.campaign.track.genres.map(g => g.id),
	);

	const estimatedPlaylists = Math.ceil(
		(props.campaign.curatorReach * totalPlaylists) / totalCurators,
	);

	const metadata: StripeTransactionMetadata = {
		createdById: props.user.id,
		workspaceId: workspace.id,
	};

	const lineItemMetadata: StripeLineItemMetadata = {
		campaignId: props.campaign.id,
	};

	const session = await stripe.checkout.sessions.create({
		customer: workspace.stripeCustomerId,
		mode: 'payment',
		success_url: successUrl,
		cancel_url: cancelUrl,
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: 'usd',
					unit_amount: 100 * costInDollars,
					product_data: {
						name: `${props.campaign.track.name}`,
						description: `playlist.pitch · 👥 ${props.campaign.curatorReach} curators · 🎧 ${estimatedPlaylists} playlists`,
						images: [props.campaign.track.imageUrl ?? ''],
						metadata: lineItemMetadata,
					},
				},
			},
		],
		client_reference_id: props.campaign.id,
		metadata,
	});

	return session.url;
}
export async function getCampaignById(campaignId: string) {
	const campaign = await dbHttp.query.Campaigns.findFirst({
		where: eq(Campaigns.id, campaignId),
		with: {
			workspace: true,
			track: {
				with: {
					_genres: {
						with: {
							genre: true,
						},
					},
				},
			},
		},
	});

	if (!campaign) {
		throw new Error(`No campaign found with id ${campaignId}`);
	}

	const campaignWithTrackAndGenres: CampaignWithWorkspaceAndTrackAndGenres = {
		...campaign,
		track: {
			...campaign.track,
			genres: campaign.track._genres.map(_g => _g.genre),
			_genres: [],
		},
	};
	return campaignWithTrackAndGenres;
}

export async function getCampaignsByUserId(
	userId: string,
	db: Db,
	opts: {
		type?: Campaign['type'];
		stage?: Campaign['stage'];
		limit: number;
	},
) {
	// find all campaigns that were a) created by the user or b) have a track that belongs to an artist that the user is a member of

	const userWithCampaigns = await db.http.query.Users.findFirst({
		where: eq(Users.id, userId),
		with: {
			_workspaces: {
				with: {
					workspace: {
						with: {
							tracks: {
								with: {
									campaigns: {
										limit: opts.limit,
									},
								},
							},
						},
					},
				},
			},
		},
	});

	if (!userWithCampaigns)
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'User not found',
		});

	// create a new map of all the campaigns that the user has access to

	const campaignsMap = new Map<string, CampaignWithTeamAndTrack>();

	userWithCampaigns._workspaces.forEach(_w => {
		_w.workspace.tracks.forEach(track => {
			track.campaigns.forEach(c => {
				if (
					(!opts.type || c.type === opts.type) &&
					(!opts.stage || c.stage === opts.stage)
				) {
					campaignsMap.set(c.id, {
						...c,
						track,
						workspace: _w.workspace,
					});
				}
			});
		});
	});

	const campaigns = Array.from(campaignsMap.values());

	return campaigns;
}

export async function getCampaignsByWorkspaceId(
	workspaceId: string,
	db: Db,
	opts: {
		type?: Campaign['type'];
		stage?: Campaign['stage'];
		limit: number;
	},
) {
	// conditional where
	// const where: SQL[] = [eq(Campaigns.workspaceId, workspaceId)];

	// if (opts.type) {
	// 	where.push(eq(Campaigns.type, opts.type));
	// }

	// if (opts.stage) {
	// 	where.push(eq(Campaigns.stage, opts.stage));
	// }

	const campaigns = await db.http.query.Campaigns.findMany({
		where: sqlAnd([
			eq(Campaigns.workspaceId, workspaceId),
			opts.type && eq(Campaigns.type, opts.type),
			opts.stage && eq(Campaigns.stage, opts.stage),
		]),
		with: {
			track: {
				with: {
					_genres: {
						with: {
							genre: true,
						},
					},
				},
			},
		},
		limit: opts.limit,
	});

	const campaignsWithTrackAndGenres: CampaignWithTrackAndGenres[] = campaigns.map(c => ({
		...c,
		track: {
			...c.track,
			genres: c.track._genres.map(g => g.genre),
			_genres: [],
		},
	}));

	return campaignsWithTrackAndGenres;
}

export async function getCampaignsToScreen(db: Db) {
	const campaigns = await db.http.query.Campaigns.findMany({
		where: eq(Campaigns.stage, 'screening'),
		with: {
			track: {
				with: {
					_genres: {
						with: {
							genre: true,
						},
					},
				},
			},
		},
		limit: 2,
	});

	return campaigns.map(c => ({
		...c,
		track: {
			...c.track,
			genres: c.track._genres.map(g => g.genre),
		},
	}));
}

export async function createPlaylistPitchCampaign(props: {
	user: SessionUser;
	trackId: string;
	sendConfirmationEmail?: boolean;
	db: Db;
}) {
	const track = await props.db.http.query.Tracks.findFirst({
		where: eq(Tracks.id, props.trackId),
	});

	if (!track) {
		throw new Error(`No track found with id ${props.trackId}`);
	}

	const newCampaign: InsertCampaign = {
		id: newId('campaign'),
		type: 'playlistPitch',
		stage: 'screening',
		createdById: props.user.id,
		trackId: props.trackId,
		workspaceId: track.workspaceId,
	};

	await props.db.http.insert(Campaigns).values(newCampaign);

	const campaign = await getCampaignById(newCampaign.id);

	// 📧 send email/text to A&R team for screening

	await sendEmail({
		from: 'support@barely.io',
		fromFriendlyName: 'Barely',
		to: 'adam@barelysparrow.com',
		subject: 'New campaign for screening',
		type: 'transactional',
		react: PlaylistPitchToScreenEmailTemplate({
			firstName: 'Adam',
			loginLink: getAbsoluteUrl('app', 'screen'), //fixme: this needs a handle
		}),
	});

	await sendText({
		to: env.SCREENING_PHONE_NUMBER,
		body: `New campaign for screening: ${newCampaign.id}`,
	});

	// 📧 send email to user to verify email (if it's a new user)

	if (props.sendConfirmationEmail) {
		const userConfirmEmailLink = await createLoginLink({
			user: props.user,
			provider: 'email',
			identifier: props.user.email,
			callbackPath: `${campaign.workspace.handle}/campaigns`,
		});

		await sendEmail({
			from: 'support@barely.io',
			fromFriendlyName: 'Barely',
			to: props.user.email,
			subject: `Confirm your playlist.pitch submission for ${track.name}`,
			react: PlaylistPitchConfirmEmailTemplate({
				firstName: props.user.firstName ?? undefined,
				trackName: track.name,
				loginLink: userConfirmEmailLink,
			}),

			type: 'transactional',
		});
	}

	return newCampaign;
}
