import { redirect } from "next/navigation";
import { getDefaultWorkspace } from "@barely/lib/server/auth/auth.fns";

export async function handleLoggedIn() {
  const defaultWorkspace = await getDefaultWorkspace();

  if (defaultWorkspace) return redirect(`/${defaultWorkspace.handle}/links`);

  return;
}
