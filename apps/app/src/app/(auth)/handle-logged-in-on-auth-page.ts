import type { SessionWorkspace } from '@barely/auth';
import { redirect } from 'next/navigation';
import { getUserWorkspacesById } from '@barely/lib/functions/workspace.fns';

import { getSession } from '~/auth/server';

export async function handleLoggedInOnAuthPage(props?: { callbackUrl?: string }) {
	let defaultWorkspace: SessionWorkspace | null = null;

	const session = await getSession();

	if (session?.user && props?.callbackUrl) {
		return redirect(props.callbackUrl);
	}

	if (session?.user) {
		// Fetch workspaces separately (no longer in session)
		const { workspaces } = await getUserWorkspacesById(session.user.id);
		// Get default workspace (prefer non-personal workspace)
		defaultWorkspace = workspaces.find(w => w.type !== 'personal') ?? null;
	}

	if (defaultWorkspace) return redirect(`/${defaultWorkspace.handle}/fm`);

	// Don't redirect to root if no session - this prevents redirect loops
	return;
}
