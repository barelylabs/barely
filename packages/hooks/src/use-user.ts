'use client';

import type { EnrichedUser } from '@barely/lib/trpc/types';
import { createContext, useContext } from 'react';

export const UserContext = createContext<EnrichedUser | null>(null);

export const useUser = () => {
	const currentUser = useContext(UserContext);

	if (!currentUser) {
		throw new Error('useUserContext must be used within a UserContextProvider');
	}

	return currentUser;
};
