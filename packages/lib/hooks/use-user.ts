import { createContext, useContext } from 'react';

import { SessionUser } from '../server/auth';

export const UserContext = createContext<SessionUser | null>(null);

export const useUser = () => {
	const currentUser = useContext(UserContext);

	if (!currentUser) {
		throw new Error('useUserContext must be used within a UserContextProvider');
	}

	return currentUser;
};
