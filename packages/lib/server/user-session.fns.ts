import type { UserSession } from "./user-session.schema";

export function deserializeUserSession(userSession: UserSession) {
  return {
    ...userSession,
    expires: new Date(userSession.expires),
  };
}

export function serializeUserSession(userSession: {
  userId: string;
  sessionToken: string;
  expires: Date;
}) {
  return {
    ...userSession,
    expires: userSession.expires.toISOString(),
  };
}
