import { redirect } from 'next/navigation';

import { getDefaultWorkspaceFromSession } from '@barely/auth/utils';

import { getSession } from '~/auth/server';

export default async function RootPage() {
	const session = await getSession();

	if (!session) return redirect('/login');

	const defaultWorkspace = getDefaultWorkspaceFromSession(session);

	// If user has no non-personal workspace, redirect to onboarding
	if (!defaultWorkspace) {
		return redirect('/onboarding');
	}

	return redirect(`${defaultWorkspace.handle}/links`);
}
