'use client';

import type { SessionUser } from '@barely/auth';
import { createContext, useContext } from 'react';

export const UserContext = createContext<SessionUser | null>(null);

export const useUser = () => {
	const currentUser = useContext(UserContext);

	if (!currentUser) {
		throw new Error('useUserContext must be used within a UserContextProvider');
	}

	return currentUser;
};
