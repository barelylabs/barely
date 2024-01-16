import { sendEmail } from "@barely/email";
import { PlaylistPitchConfirmEmailTemplate } from "@barely/email/src/templates/playlist-pitch-confirm";
import { PlaylistPitchToScreenEmailTemplate } from "@barely/email/src/templates/playlist-pitch-to-screen";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import type {
  Campaign,
  CampaignWithTeamAndTrack,
  CampaignWithTrackAndGenres,
  CampaignWithWorkspaceAndTrackAndGenres,
  InsertCampaign,
} from "./campaign.schema";
import type { Db } from "./db";
import type { User } from "./user.schema";
import env from "../env";
// import { APP_BASE_URL } from "../utils/constants";
import { dbRead } from "../utils/db";
import { newId } from "../utils/id";
import { sendText } from "../utils/sms";
import { sqlAnd } from "../utils/sql";
import { createLoginLink } from "./auth/auth.fns";
import { Campaigns } from "./campaign.sql";
import { Tracks } from "./track.sql";
import { Users } from "./user.sql";

export async function getCampaignById(campaignId: string, db: Db) {
  const campaign = await dbRead(db).query.Campaigns.findFirst({
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
      genres: campaign.track._genres.map((_g) => _g.genre),
    },
  };
  return campaignWithTrackAndGenres;
}

export async function getCampaignsByUserId(
  userId: string,
  db: Db,
  opts: {
    type?: Campaign["type"];
    stage?: Campaign["stage"];
    limit: number;
  },
) {
  // find all campaigns that were a) created by the user or b) have a track that belongs to an artist that the user is a member of

  const userWithCampaigns = await dbRead(db).query.Users.findFirst({
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
      code: "INTERNAL_SERVER_ERROR",
      message: "User not found",
    });

  // create a new map of all the campaigns that the user has access to

  const campaignsMap = new Map<string, CampaignWithTeamAndTrack>();

  userWithCampaigns._workspaces.forEach((_w) => {
    _w.workspace.tracks.forEach((track) => {
      track.campaigns.forEach((c) => {
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
    type?: Campaign["type"];
    stage?: Campaign["stage"];
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

  const campaigns = await dbRead(db).query.Campaigns.findMany({
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

  const campaignsWithTrackAndGenres: CampaignWithTrackAndGenres[] =
    campaigns.map((c) => ({
      ...c,
      track: {
        ...c.track,
        genres: c.track._genres.map((g) => g.genre),
      },
    }));

  return campaignsWithTrackAndGenres;
}

export async function getCampaignsToScreen(db: Db) {
  const campaigns = await dbRead(db).query.Campaigns.findMany({
    where: eq(Campaigns.stage, "screening"),
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

  return campaigns.map((c) => ({
    ...c,
    track: {
      ...c.track,
      genres: c.track._genres.map((g) => g.genre),
    },
  }));
}

export async function createPlaylistPitchCampaign(props: {
  user: User;
  trackId: string;
  sendConfirmationEmail?: boolean;
  db: Db;
}) {
  const track = await dbRead(props.db).query.Tracks.findFirst({
    where: eq(Tracks.id, props.trackId),
  });

  if (!track) {
    throw new Error(`No track found with id ${props.trackId}`);
  }

  const newCampaign: InsertCampaign = {
    id: newId("campaign"),
    type: "playlistPitch",
    stage: "screening",
    createdById: props.user.id,
    trackId: props.trackId,
    workspaceId: track.workspaceId,
  };

  await props.db.write.insert(Campaigns).values(newCampaign);

  const campaign = await getCampaignById(newCampaign.id, props.db);

  // 📧 send email/text to A&R team for screening

  await sendEmail({
    from: "support@barely.io",
    to: "adam@barelysparrow.com",
    subject: "New campaign for screening",
    type: "transactional",
    react: PlaylistPitchToScreenEmailTemplate({
      firstName: "Adam",
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
      provider: "email",
      identifier: props.user.email,
      callbackUrl: `${env.NEXT_PUBLIC_APP_BASE_URL}/${campaign.workspace.handle}/campaigns`,
    });

    await sendEmail({
      from: "support@barely.io",
      to: props.user.email,
      subject: `Confirm your playlist.pitch submission for ${track.name}`,
      react: PlaylistPitchConfirmEmailTemplate({
        firstName: props.user.firstName ?? undefined,
        trackName: track.name,
        loginLink: userConfirmEmailLink,
      }),

      type: "transactional",
    });
  }

  return newCampaign;
}
