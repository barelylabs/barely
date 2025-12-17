import { redirect } from 'next/navigation';
import { getUserWorkspacesById } from '@barely/lib/functions/workspace.fns';

import { getDefaultWorkspace } from '@barely/auth/utils';

import { getSession } from '~/auth/server';

export default async function RootPage() {
	const session = await getSession();

	if (!session) return redirect('/login');

	// Workspaces are no longer in session, fetch them separately
	const { workspaces } = await getUserWorkspacesById(session.user.id);
	const defaultWorkspace = getDefaultWorkspace(workspaces);

	// If user has no non-personal workspace, redirect to onboarding
	if (!defaultWorkspace) {
		return redirect('/onboarding');
	}

	return redirect(`${defaultWorkspace.handle}/links`);
}
