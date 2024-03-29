import type { AdapterUser } from "@auth/core/adapters";
import { and, eq } from "drizzle-orm";

import type { SessionUser } from "./auth";
import type { Db } from "./db";
import type { ProviderAccount } from "./provider-account.schema";
import type { CreateUser, InsertUser } from "./user.schema";
import type { InsertWorkspace } from "./workspace.schema";
//
import { convertToHandle } from "../utils/handle";
import { newId } from "../utils/id";
import { fullNameToFirstAndLast, parseFullName } from "../utils/name";
import { parseForDb } from "../utils/phone-number";
import { raise } from "../utils/raise";
import {
  _Files_To_Workspaces__AvatarImage,
  _Files_To_Workspaces__HeaderImage,
} from "./file.sql";
import { ProviderAccounts } from "./provider-account.sql";
import { createStripeUser } from "./stripe.fns";
import { _Users_To_Workspaces, Users } from "./user.sql";
import { Workspaces } from "./workspace.sql";

("@auth/core/adapters");

/** START HELPER FUNCTIONS */
export const rawSessionUserWith = {
  _workspaces: {
    with: {
      workspace: {
        with: {
          _avatarImages: {
            where: () => eq(_Files_To_Workspaces__AvatarImage.current, true),
            with: {
              file: true,
            },
            limit: 1,
          },
          _headerImages: {
            where: () => eq(_Files_To_Workspaces__HeaderImage.current, true),
            with: {
              file: true,
            },
            limit: 1,
          },
        },
      },
    },
  },
} as const;

export async function getRawSessionUserByUserId(userId: string, db: Db) {
  const userWithWorkspaces = await db.http.query.Users.findFirst({
    where: (Users) => eq(Users.id, userId),
    with: rawSessionUserWith,
  });

  return userWithWorkspaces;
}

type RawSessionUser = NonNullable<
  Awaited<ReturnType<typeof getRawSessionUserByUserId>>
>;

export function getSessionUserFromRawUser(user: RawSessionUser): SessionUser {
  const sessionUser: SessionUser = {
    ...user,
    workspaces: user._workspaces.map((_w) => ({
      ..._w.workspace,
      avatarImageUrl: _w.workspace._avatarImages[0]?.file?.src ?? "",
      headerImageUrl: _w.workspace._headerImages[0]?.file?.src ?? "",
      role: _w.role,
    })),
  };

  return sessionUser;
}
/** END HELPER FUNCTIONS */

export async function checkEmailExistsOnServer(email: string, db: Db) {
  const emailExists = await db.http.query.Users.findFirst({
    where: (Users) => eq(Users.email, email),
  }).then((u) => !!u);

  return emailExists;
}

export async function createUser(user: CreateUser, db: Db) {
  const fullName =
    user.fullName ?? fullNameToFirstAndLast(user.firstName, user.lastName);
  const firstName = user.firstName ?? parseFullName(fullName).firstName;
  const lastName = user.lastName ?? parseFullName(fullName).lastName;
  let handle = user.handle ?? convertToHandle(`${firstName}_${lastName}`);

  const phone = user.phone ? parseForDb(user.phone) : undefined;

  const newUserId = newId("user");
  const newWorkspaceId = newId("workspace");

  // check if handle is available
  let existingHandle = await db.http.query.Users.findFirst({
    where: (Users) => eq(Users.handle, handle),
  }).then((u) => u?.handle);

  console.log("existing handle ", existingHandle);

  if (existingHandle) {
    // if handle is taken, append a number to the end
    let i = 1;

    while (existingHandle) {
      handle = `${existingHandle}${i}`;
      existingHandle = await db.http.query.Users.findFirst({
        where: (Users) => eq(Users.handle, handle),
      }).then((u) => u?.handle);

      if (existingHandle) console.log("handle taken ", handle);
      if (!existingHandle) console.log("handle available ", handle);
      if (i > 100) raise("Failed to create handle");
      i++;
    }
  }

  const newUser: InsertUser = {
    ...user,
    id: newUserId,
    personalWorkspaceId: newWorkspaceId,
    handle,
    fullName,
    firstName,
    lastName,
    phone,
  };

  const newWorkspace: InsertWorkspace = {
    id: newWorkspaceId,
    name: fullName,
    handle,
    // imageUrl: user.image,
    type: "personal",
  };

  await db.pool
    .transaction(async (tx) => {
      await tx.insert(Workspaces).values(newWorkspace);
      await tx.insert(Users).values(newUser);
      await tx.insert(_Users_To_Workspaces).values({
        userId: newUserId,
        workspaceId: newWorkspaceId,
        role: "owner",
      });
    })
    .catch((err) => {
      raise(err);
    });

  const newUserWithStripe = await createStripeUser({
    name: fullName,
    userId: newUser.id,
    email: user.email,
    phone,
    db: db,
  });

  if (!newUserWithStripe) throw new Error("Failed to create Stripe user");

  return newUserWithStripe;
}

export async function getSessionUserByUserId(userId: string, db: Db) {
  const rawUser = await getRawSessionUserByUserId(userId, db);
  if (!rawUser) return null;
  return getSessionUserFromRawUser(rawUser);
}

export async function getSessionUserByEmail(email: string, db: Db) {
  const userWithWorkspaces = await db.http.query.Users.findFirst({
    where: (Users) => eq(Users.email, email),
    with: rawSessionUserWith,
  });

  if (!userWithWorkspaces) return null;

  return getSessionUserFromRawUser(userWithWorkspaces);
}

export async function getSessionUserByAccount(
  provider: ProviderAccount["provider"],
  providerAccountId: string,
  db: Db,
) {
  const providerAccount = await db.http.query.ProviderAccounts.findFirst({
    where: and(
      eq(ProviderAccounts.provider, provider),
      eq(ProviderAccounts.providerAccountId, providerAccountId),
    ),
    with: {
      user: {
        with: rawSessionUserWith,
      },
    },
  });

  if (!providerAccount) return null;

  // const sessionUser: SessionUser = {
  //   ...providerAccount.user,
  //   workspaces: providerAccount.user._workspaces.map((_w) => ({
  //     ..._w.workspace,
  //     avatarImageUrl: _w.workspace._avatarImages[0]?.image?.src ?? "",
  //     headerImageUrl: _w.workspace._headerImages[0]?.image?.src ?? "",
  //     role: _w.role,
  //   })),
  // };

  return getSessionUserFromRawUser(providerAccount.user);
}

export function deserializeUser(user: SessionUser) {
  return {
    ...user,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  };
}

export function serializeUser(user: Partial<AdapterUser>) {
  return {
    ...user,
    emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
  };
}
