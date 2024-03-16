import type { SessionUser } from "../server/auth";
import { raise } from "./raise";

export function getUserWorkspaceByHandle(user: SessionUser, handle: string) {
  return (
    user.workspaces.find((w) => w.handle === handle) ??
    raise("Workspace not found")
  );
}
