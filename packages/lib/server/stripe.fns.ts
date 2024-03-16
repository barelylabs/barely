import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

import type { CampaignWithWorkspaceAndTrackAndGenres } from "./campaign.schema";
import type { Db } from "./db";
import type {
  StripeLineItemMetadata,
  StripeTransactionMetadata,
} from "./stripe.schema";
import type { InsertTransactionLineItem } from "./transaction-line-item.schema";
import type { Transaction } from "./transaction.schema";
import type { User } from "./user.schema";
import type { Workspace } from "./workspace.schema";
import type { PlanType } from "./workspace.settings";
import { env } from "../env";
import { playlistPitchCostInDollars } from "../utils/campaign";
import { newId } from "../utils/id";
import { log } from "../utils/log";
import { fullNameToFirstAndLast } from "../utils/name";
import { pushEvent } from "../utils/pusher-server";
import { getAbsoluteUrl } from "../utils/url";
import { Campaigns } from "./campaign.sql";
import { assignPlaylistPitchToReviewers } from "./playlist-pitch-review.fns";
import { totalPlaylistReachByGenres } from "./playlist.fns";
import {
  stripeLineItemMetadataSchema,
  stripeTransactionMetadataSchema,
} from "./stripe.schema";
import { TransactionLineItems } from "./transaction-line-item.sql";
import { Transactions } from "./transaction.sql";
import { Users } from "./user.sql";
import { WORKSPACE_PLANS } from "./workspace.settings";
import { Workspaces } from "./workspace.sql";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

export async function createStripeUser(props: {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  db: Db;
}) {
  const customer = await stripe.customers.create({
    email: props.email,
    phone: props.phone,
    name: props.name,
    metadata: {
      userId: props.userId,
    },
  });

  // return customer
  await props.db.http.update(Users).set(
    env.VERCEL_ENV === "development" || env.VERCEL_ENV === "preview"
      ? {
          stripeId_devMode: customer.id,
        }
      : {
          stripeId: customer.id,
        },
  );

  const userWithStripe = await props.db.http
    .select()
    .from(Users)
    .where(eq(Users.id, props.userId))
    .limit(1)
    .then((users) => users[0]);

  return userWithStripe;
}

export async function createPlanCheckoutLink(props: {
  user: User;
  workspace: Workspace;
  planId: PlanType;
  billingCycle: "monthly" | "yearly";
  successPath?: string;
  cancelPath?: string;
  db: Db;
}) {
  const testEnvironment =
    env.VERCEL_ENV === "development" || env.VERCEL_ENV === "preview";
  const priceId = WORKSPACE_PLANS.get(props.planId)?.price[props.billingCycle]
    .priceIds[testEnvironment ? "test" : "production"];

  if (!priceId) {
    throw new Error("Invalid priceId.");
  }

  const userHasStripeId = testEnvironment
    ? !!props.user.stripeId_devMode
    : !!props.user.stripeId;

  const user = userHasStripeId
    ? props.user
    : await createStripeUser({
        userId: props.user.id,
        email: props.user.email,
        name:
          props.user.fullName ??
          fullNameToFirstAndLast(props.user.firstName, props.user.lastName),
        phone: props.user.phone ?? undefined,
        db: props.db,
      });

  if (!user?.stripeId) {
    throw new Error("User must have a stripeId.");
  }

  const successUrl = getAbsoluteUrl(
    "app",
    props.successPath ??
      `${props.workspace.handle}/settings/billing?success=true`,
  );
  const cancelUrl = getAbsoluteUrl(
    "app",
    props.cancelPath ?? `${props.workspace.handle}/settings/billing`,
  );

  const metadata: StripeTransactionMetadata = {
    createdById: user.id,
    workspaceId: props.workspace.id,
  };

  const session = await stripe.checkout.sessions.create({
    customer: user.stripeId ?? undefined,
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    client_reference_id: props.workspace.id,
    metadata,
  });

  return session.url;
}

export async function createPitchCheckoutLink(props: {
  user: User;
  campaign: CampaignWithWorkspaceAndTrackAndGenres;
  db: Db;
}) {
  if (!props.campaign.curatorReach) {
    throw new Error("Campaign must have a defined curator reach.");
  }

  const user = props.user.stripeId
    ? props.user
    : await createStripeUser({
        userId: props.user.id,
        email: props.user.email,
        name:
          props.user.fullName ??
          fullNameToFirstAndLast(props.user.firstName, props.user.lastName),
        phone: props.user.phone ?? undefined,
        db: props.db,
      });

  if (!user?.stripeId) {
    throw new Error("User must have a stripeId.");
  }

  const successUrl = getAbsoluteUrl(
    "app",
    `${props.campaign.workspace.handle}/campaign/${props.campaign.id}?success=true`,
  );

  const cancelUrl = getAbsoluteUrl(
    "app",
    `${props.campaign.workspace.handle}/campaign/${props.campaign.id}/launch`,
  );

  const costInDollars = playlistPitchCostInDollars({
    curatorReach: props.campaign.curatorReach,
  });

  const { totalPlaylists, totalCurators } = await totalPlaylistReachByGenres(
    props.campaign.track.genres.map((g) => g.id),
    props.db,
  );

  const estimatedPlaylists = Math.ceil(
    (props.campaign.curatorReach * totalPlaylists) / totalCurators,
  );

  const metadata: StripeTransactionMetadata = {
    createdById: user.id,
    workspaceId: props.campaign.workspaceId,
  };

  const lineItemMetadata: StripeLineItemMetadata = {
    campaignId: props.campaign.id,
  };

  const session = await stripe.checkout.sessions.create({
    customer: user.stripeId ?? undefined,
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 100 * costInDollars,
          product_data: {
            name: `${props.campaign.track.name}`,
            description: `playlist.pitch · 👥 ${props.campaign.curatorReach} curators · 🎧 ${estimatedPlaylists} playlists`,
            images: [props.campaign.track.imageUrl ?? ""],
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

export function getPlanByStripePriceId(priceId: string) {
  for (const [, plan] of WORKSPACE_PLANS) {
    if (
      plan.price.monthly.priceIds.test === priceId ||
      plan.price.monthly.priceIds.production === priceId ||
      plan.price.yearly.priceIds.test === priceId ||
      plan.price.yearly.priceIds.production === priceId
    ) {
      return plan;
    }
  }
  return undefined;
}

export async function handleStripeCheckoutSessionComplete(
  session: Stripe.Checkout.Session,
  db: Db,
) {
  const transactionMetadata = stripeTransactionMetadataSchema.parse(
    session.metadata,
  );
  const transactionId = newId("transaction");

  const transaction: Transaction = {
    id: transactionId,
    workspaceId: transactionMetadata.workspaceId,
    completedAt: new Date().toISOString(),
    amount: session.amount_total ?? 0,
    status: "succeeded",
    stripeId: session.id,
    stripeMetadata: transactionMetadata,
    createdById: transactionMetadata.createdById,
  };

  const lineItems: InsertTransactionLineItem[] = [];
  const campaignIds: string[] = [];

  console.log("session.line_items => ", session.line_items);

  console.log(
    "session.line_items.price => ",
    session.line_items?.data.map((li) => li.price),
  );

  if (session.line_items) {
    await Promise.allSettled(
      session.line_items.data.map(async (line_item, idx) => {
        // console.log(`product ${idx} => `, line_item.price?.product);
        const product = line_item.price?.product as Stripe.Product;
        const lineItemMetadata = stripeLineItemMetadataSchema.parse(
          product.metadata,
        );

        console.log(`lineItemMetadata ${idx}`, lineItemMetadata);

        /**
         * WORKSPACE PLAN
         * */
        const plan = line_item.price?.id
          ? getPlanByStripePriceId(line_item.price.id)
          : undefined;

        if (plan) {
          //
          /** when the workspace subscribes to a plan, update the workspace:
           * plan,
           * linkUsageLimit,
           * billingCycleStart,
           */

          const workspace = await db.http.query.Workspaces.findFirst({
            where: eq(Workspaces.id, transactionMetadata.workspaceId),
          });

          if (!workspace) {
            await log({
              type: "stripe",
              fn: "handleStripeCheckoutSessionComplete",
              message: `Workspace with Stripe ID ${transactionMetadata.workspaceId} not found.`,
            });

            return NextResponse.json({ received: true }, { status: 200 });
          }

          await db.pool
            .update(Workspaces)
            .set({
              plan: plan.id,
              linkUsageLimit: plan.linkUsageLimit,
              billingCycleStart: new Date().getDate(),
            })
            .where(eq(Workspaces.id, workspace.id));

          await pushEvent("workspace", "update", {
            id: workspace.id,
          });

          const item: InsertTransactionLineItem = {
            id: newId("lineItem"),
            transactionId: transactionId,
            totalDue: line_item.amount_total ?? 0,
            paymentType: "subscription",
            name: plan.name,
            description: plan.name,
          };

          return lineItems.push(item);
        }

        /** CAMPAIGNS */
        const campaign = lineItemMetadata.campaignId
          ? await db.http.query.Campaigns.findFirst({
              where: eq(Campaigns.id, lineItemMetadata.campaignId),
              with: {
                track: {
                  with: {
                    _genres: true,
                  },
                },
              },
            })
          : undefined;

        let name = "";
        let description = "";

        if (campaign) {
          campaignIds.push(campaign.id);

          switch (campaign.type) {
            case "playlistPitch": {
              if (!campaign.curatorReach) {
                throw new Error("Campaign must have a defined curator reach.");
              }

              console.log("assigning playlist pitch to reviewers");
              await assignPlaylistPitchToReviewers(campaign.id, db);

              const { totalPlaylists, totalCurators } =
                await totalPlaylistReachByGenres(
                  campaign.track._genres.map((_g) => _g.genreId),
                  db,
                );

              const estimatedPlaylists = Math.ceil(
                (campaign.curatorReach * totalPlaylists) / totalCurators,
              );

              name = `playlist.pitch :: ${campaign.track.name ?? ""}`;
              description = `👥 ${campaign.curatorReach} curators · 🎧 ${estimatedPlaylists} playlists `;

              break;
            }
          }
          const item: InsertTransactionLineItem = {
            id: newId("lineItem"),
            transactionId: transactionId,
            totalDue: line_item.amount_total ?? 0,
            paymentType: "oneTime",
            name,
            description,
          };

          return lineItems.push(item);
        }
      }),
    );
  }

  await db.pool.transaction(async (tx) => {
    console.log("adding transaction to db => ", transaction);

    await tx.insert(Transactions).values(transaction);

    console.log("adding line items to db => ", lineItems);

    await tx.insert(TransactionLineItems).values(lineItems);

    await Promise.allSettled(
      campaignIds.map(async (campaignId) => {
        await tx
          .update(Campaigns)
          .set({
            stage: "active",
          })
          .where(eq(Campaigns.id, campaignId));
      }),
    );
  });
}
