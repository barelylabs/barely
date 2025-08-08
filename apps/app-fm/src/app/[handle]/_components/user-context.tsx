'use client';

import type { SessionUser } from '@barely/auth';
import type { ReactNode } from 'react';
import { UserContext } from '@barely/hooks';

interface UserContextProviderProps {
	user: SessionUser;
	children: ReactNode;
}

export const UserContextProvider = (props: UserContextProviderProps) => {
	return <UserContext.Provider value={props.user}>{props.children}</UserContext.Provider>;
};
