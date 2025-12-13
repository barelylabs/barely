'use client';

import type { EnrichedUser } from '@barely/lib/trpc/types';
import type { ReactNode } from 'react';
import { UserContext } from '@barely/hooks';

interface UserContextProviderProps {
	user: EnrichedUser;
	children: ReactNode;
}

export const UserContextProvider = (props: UserContextProviderProps) => {
	return <UserContext.Provider value={props.user}>{props.children}</UserContext.Provider>;
};
