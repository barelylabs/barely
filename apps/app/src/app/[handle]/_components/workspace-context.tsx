"use client";

import type { ReactNode } from "react";
import { WorkspaceContext } from "@barely/lib/context/workspace.context";

import type { SessionWorkspace } from "@barely/server/auth";

export function WorkspaceContextProvider({
  workspace,
  children,
}: {
  children: ReactNode;
  workspace: SessionWorkspace;
}) {
  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
}
