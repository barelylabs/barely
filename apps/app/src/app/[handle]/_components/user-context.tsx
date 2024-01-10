"use client";

import type { ReactNode } from "react";
import { UserContext } from "@barely/hooks/use-user";

import type { SessionUser } from "@barely/server/auth";

interface UserContextProviderProps {
  user: SessionUser;
  children: ReactNode;
}

export const UserContextProvider = (props: UserContextProviderProps) => {
  return (
    <UserContext.Provider value={props.user}>
      {props.children}
    </UserContext.Provider>
  );
};
