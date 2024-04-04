import { useContext } from 'react';
import { useParams } from 'next/navigation';

import { WorkspaceContext } from '../context/workspace.context';
import { api } from '../server/api/react';
import { useSubscribe } from './use-subscribe';

export function useWorkspaceHandle() {
	const params = useParams();

	const handle = params?.handle;

	if (typeof handle === 'string') return handle;

	return null;
}

export function useWorkspace() {
	const currentWorkspace = useContext(WorkspaceContext);

	const apiUtils = api.useUtils();

	if (!currentWorkspace) {
		throw new Error('useWorkspace must be used within a WorkspaceProvider');
	}

	/* we'll hydrate the workspace from the server to start, but then we want 
	to keep up to date w/ React Query after that */
	const { data: workspace } = api.workspace.current.useQuery(undefined, {
		initialData: currentWorkspace,
	});

	if (!workspace) {
		throw new Error('useWorkspace must be used within a WorkspaceProvider');
	}

	/* subscribe to updates to the workspace */
	useSubscribe({
		subscribeTo: {
			channel: 'workspace',
			ids: [workspace.id],
		},
		callback: async () => {
			await apiUtils.workspace.invalidate();
		},
	});

	return workspace;
}

export function useWorkspaceIsPersonal() {
	const workspace = useWorkspace();

	return workspace.type === 'personal';
}

// export const usePossibleWorkspace = () => {
// 	return useAtomValue(workspaceAtom);
// };
