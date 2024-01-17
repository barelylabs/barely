import { sendEmail } from "@barely/email";
import SignInEmailTemplate from "@barely/email/src/templates/sign-in";
import { eq } from "drizzle-orm";

import { auth } from ".";
import env from "../../env";
import { raise } from "../../utils/raise";
import { absoluteUrl } from "../../utils/url";
import { db } from "../db";
import { UserSessions } from "../user-session.sql";
import { Users } from "../user.sql";
import { VerificationTokens } from "../verification-token.sql";

export { signOut } from "next-auth/react";

export async function createLoginLink(props: {
  provider: "email" | "phone";
  identifier: string;
  callbackPath?: string;
  expiresInSeconds?: number;
}) {
  const token = generateVerificationToken();
  const hashedToken = await hashToken(token);

  const defaultWorkspace = await getDefaultWorkspace();

  const callbackUrl = absoluteUrl(
    "app",
    props.callbackPath ?? `${defaultWorkspace.handle}/links`,
  );

  const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
  const expiresIn = props.expiresInSeconds ?? THIRTY_DAYS_IN_SECONDS;

  const expires = new Date(Date.now() + expiresIn * 1000).toISOString();

  await db.http.insert(VerificationTokens).values({
    token: hashedToken,
    expires,
    identifier: props.identifier,
  });

  const params = new URLSearchParams({
    token,
    callbackUrl,
  });

  if (props.provider === "email") params.append("email", props.identifier);
  if (props.provider === "phone") params.append("phone", props.identifier);

  return `${env.AUTH_URL}/api/auth/callback/${
    props.provider
  }?${params.toString()}`;
}

export async function getDefaultWorkspace() {
  const session = await auth();
  const workspaces = session?.user?.workspaces ?? [];
  const defaultWorkspace = workspaces[0];
  return defaultWorkspace ?? raise("No default workspace");
}

export function generateVerificationToken() {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(tokenBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return token;
}

async function hashToken(token: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${token}${env.NEXTAUTH_SECRET}`);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  const hashedToken = Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return hashedToken;
}

export async function sendLoginEmail(props: {
  email: string;
  callbackUrl: string;
}) {
  const dbUser =
    (await db.http.query.Users.findFirst({
      where: eq(Users.email, props.email),
    })) ?? raise("Email not found");

  const loginLink = await createLoginLink({
    provider: "email",
    identifier: props.email,
    callbackPath: props.callbackUrl,
  });

  const SignInEmail = SignInEmailTemplate({
    firstName: dbUser.firstName ?? undefined,
    loginLink,
  });

  const emailRes =
    (await sendEmail({
      from: "barely.io <support@barely.io>",
      to: props.email,
      subject: "Barely Login Link",
      type: "transactional",
      react: SignInEmail,
    })) ?? raise("Something went wrong");

  return emailRes;
}

export async function deleteSession(sessionToken: string) {
  console.log("deleting session : ", sessionToken);
  await db.http
    .delete(UserSessions)
    .where(eq(UserSessions.sessionToken, sessionToken));
}
