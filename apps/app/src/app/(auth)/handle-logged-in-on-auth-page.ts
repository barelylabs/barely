import { redirect } from 'next/navigation';

import { fetchUserWorkspaces, getDefaultWorkspace } from '@barely/auth/utils';

import { getSession } from '~/auth/server';

export async function handleLoggedInOnAuthPage(props?: { callbackUrl?: string }) {
	const session = await getSession();

	if (session?.user && props?.callbackUrl) {
		return redirect(props.callbackUrl);
	}

	if (session) {
		const workspaces = await fetchUserWorkspaces(session.user.id);
		const defaultWorkspace = getDefaultWorkspace(workspaces);
		if (defaultWorkspace) return redirect(`/${defaultWorkspace.handle}/fm`);
	}

	// Don't redirect to root if no session - this prevents redirect loops
	return;
}
