import { redirect } from "next/navigation";
import { getDefaultWorkspace } from "@barely/lib/server/auth/auth.fns";

import type { SessionWorkspace } from "@barely/lib/server/auth";

export async function handleLoggedInOnAuthPage() {
  let defaultWorkspace: SessionWorkspace | undefined;

  try {
    defaultWorkspace = await getDefaultWorkspace();
  } catch (err) {
    return;
  }

  if (defaultWorkspace) return redirect(`/${defaultWorkspace.handle}/links`);

  return;
}
