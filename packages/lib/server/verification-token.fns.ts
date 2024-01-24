import type { VerificationToken as AuthVerificationToken } from "@auth/core/adapters";

import type { VerificationToken } from "./verification-token.schema";

export function deserializeVerificationToken(
  verificationToken: VerificationToken,
) {
  const authVerificationToken: AuthVerificationToken = {
    ...verificationToken,
    expires: new Date(verificationToken.expires),
  };

  return authVerificationToken;
}

export function serializeVerificationToken(
  verificationToken: AuthVerificationToken,
) {
  const token: VerificationToken = {
    ...verificationToken,
    expires: verificationToken.expires.toISOString(),
  };

  return token;
}
