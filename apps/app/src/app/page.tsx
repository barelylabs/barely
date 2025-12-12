import { redirect } from 'next/navigation';

import { fetchUserWorkspaces, getDefaultWorkspace } from '@barely/auth/utils';

import { getSession } from '~/auth/server';

export default async function RootPage() {
	const session = await getSession();

	if (!session) return redirect('/login');

	const workspaces = await fetchUserWorkspaces(session.user.id);
	const defaultWorkspace = getDefaultWorkspace(workspaces);

	// If user has no non-personal workspace, redirect to onboarding
	if (!defaultWorkspace) {
		return redirect('/onboarding');
	}

	return redirect(`${defaultWorkspace.handle}/links`);
}
