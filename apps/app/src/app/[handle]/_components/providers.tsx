"use client";

import type { ReactNode } from "react";
import { useUpdateNavHistory } from "@barely/hooks/use-nav-history";
import { UserContext } from "@barely/hooks/use-user";
import { WorkspaceContext } from "@barely/lib/context/workspace.context";

import type { SessionUser, SessionWorkspace } from "@barely/server/auth";

interface UserContextProviderProps {
  user: SessionUser;
  children: ReactNode | JSX.Element;
}

export const UserContextProvider = (props: UserContextProviderProps) => {
  return (
    <UserContext.Provider value={props.user}>
      {props.children}
    </UserContext.Provider>
  );
};

interface WorkspaceContextProviderProps {
  workspace: SessionWorkspace;
  children: ReactNode | JSX.Element;
}

export function WorkspaceContextProvider({
  workspace,
  children,
}: WorkspaceContextProviderProps) {
  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function WorkspaceProviders(
  props: UserContextProviderProps & WorkspaceContextProviderProps,
) {
  useUpdateNavHistory();

  return (
    <UserContextProvider user={props.user}>
      <WorkspaceContextProvider workspace={props.workspace}>
        {props.children}
      </WorkspaceContextProvider>
    </UserContextProvider>
  );
}
