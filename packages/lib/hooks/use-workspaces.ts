import { useUser } from './use-user';

export const useWorkspaces = () => {
	const currentUser = useUser();
	return currentUser.workspaces;
};
