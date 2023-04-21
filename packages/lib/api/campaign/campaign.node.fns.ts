import { inferAsyncReturnType } from '@trpc/server';

import { prisma, Track, User } from '@barely/db';
import { sendEmail } from '@barely/email';
import { PlaylistPitchConfirmEmailTemplate } from '@barely/email/templates/playlist-pitch-confirm';
import { PlaylistPitchToScreenEmailTemplate } from '@barely/email/templates/playlist-pitch-to-screen';

import { SessionUser } from '../../auth/auth-options';
import env from '../../env';
import { sendText } from '../../sms';
import { createLoginLink } from '../auth/auth.node.fns';

// import { getGenresByUserId } from '../genre/genre.node.fns';

const campaignIncludeTrackAndMetadataConfig = {
	track: {
		include: {
			team: true,
			trackGenres: {
				select: {
					genre: {
						select: {
							_count: { select: { playlistGenres: true } },
							name: true,
						},
					},
				},
			},
		},
	},
};

const getCampaignFromPrisma = async (campaignId: string) => {
	return await prisma.campaign.findUnique({
		where: { id: campaignId },
		include: campaignIncludeTrackAndMetadataConfig,
	});
};

type GetCampaignFromPrisma = inferAsyncReturnType<typeof getCampaignFromPrisma>;
type CampaignWithMetadata = NonNullable<GetCampaignFromPrisma>;
type CampaignWithTrackAndMetadata = CampaignWithMetadata & {
	track: NonNullable<CampaignWithMetadata['track']>;
};

type RequireTrack = boolean;

type GetCampaignById<T> = T extends true
	? CampaignWithTrackAndMetadata
	: T extends false
	? CampaignWithMetadata
	: never;

const getCampaignById = async <T extends RequireTrack>(
	campaignId: string,
	opts?: { requireTrack: T },
): Promise<GetCampaignById<T> | null> => {
	const campaign = await getCampaignFromPrisma(campaignId);

	if (!campaign) return null;

	if (opts?.requireTrack && !campaign?.track) return null;

	if (opts?.requireTrack === true && campaign.track)
		// fixme: figure out how to return campaigns without casting. spent a couple hours on it and couldn't figure it out
		return { ...campaign, track: campaign.track } as GetCampaignById<T>;

	return campaign as GetCampaignById<T>;
};

const getCampaignsToScreen = async <T extends true>(): Promise<GetCampaignById<T>[]> => {
	const campaigns = await prisma.campaign.findMany({
		where: {
			stage: 'screening',
		},
		orderBy: { createdAt: 'asc' },
		include: {
			track: {
				include: {
					team: true,
					trackGenres: {
						select: {
							genre: {
								select: {
									_count: { select: { playlistGenres: true } },
									name: true,
								},
							},
						},
					},
				},
			},
		},
		take: 2,
	});

	// if (opts?.requireTrack) {
	// 	const campaignsWithTrack = campaigns.filter(
	// 		campaign => campaign.track,
	// 	) as GetCampaignById<T>[];

	// 	// console.log('campaignsToScreen campaignsWithTrack', campaignsWithTrack);

	// 	return campaignsWithTrack;
	// }
	const campaignsWithTrack = campaigns.filter(
		campaign => campaign.track,
	) as GetCampaignById<T>[];
	return campaignsWithTrack;
};

const createPlaylistPitchCampaign = async (props: {
	user: SessionUser | User;
	track: Track;
	sendConfirmationEmail?: boolean;
}) => {
	const newCampaign = await prisma.campaign.create({
		data: {
			type: 'playlistPitch',
			stage: 'screening',
			createdBy: { connect: { id: props.user.id } },
			track: { connect: { id: props.track.id } },
		},
	});

	// 📧 send email/text to A&R team for screening

	await sendEmail({
		from: 'support@barely.io',
		to: 'adam@barelysparrow.com',
		subject: 'New campaign for screening',
		type: 'transactional',
		template: PlaylistPitchToScreenEmailTemplate({
			firstName: 'Adam',
			loginLink: `${env.NEXT_PUBLIC_APP_BASE_URL}/screen`,
		}),
	});

	await sendText({
		to: env.SCREENING_PHONE_NUMBER,
		body: `New campaign for screening: ${newCampaign.id}`,
	});

	// 📧 send email to user to verify email (if it's a new user)

	if (props.sendConfirmationEmail) {
		const userConfirmEmailLink = await createLoginLink({
			provider: 'email',
			identifier: props.user.email,
			callbackUrl: `${env.NEXT_PUBLIC_APP_BASE_URL}/campaigns`,
		});

		await sendEmail({
			from: 'support@barely.io',
			to: props.user.email,
			subject: `Confirm your playlist.pitch submission for ${props.track.name}`,
			template: PlaylistPitchConfirmEmailTemplate({
				firstName: props.user.firstName ?? undefined,
				trackName: props.track.name,
				loginLink: userConfirmEmailLink,
			}),

			type: 'transactional',
		});
	}

	return newCampaign;
};

export {
	campaignIncludeTrackAndMetadataConfig,
	getCampaignById,
	getCampaignsToScreen,

	// create
	createPlaylistPitchCampaign,

	// getCampaignsToReview,
	type CampaignWithMetadata,
	type CampaignWithTrackAndMetadata,
};
