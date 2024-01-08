'use client';

import type { ReactNode } from 'react';
import type { SessionUser } from '@barely/server/auth';

import { UserContext } from '@barely/hooks/use-user';

interface UserContextProviderProps {
	user: SessionUser;
	children: ReactNode;
}

export const UserContextProvider = (props: UserContextProviderProps) => {
	return <UserContext.Provider value={props.user}>{props.children}</UserContext.Provider>;
};
