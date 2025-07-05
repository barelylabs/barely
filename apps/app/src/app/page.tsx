import { redirect } from 'next/navigation';

import { getDefaultWorkspaceFromSession } from '@barely/auth/utils';

import { getSession } from '~/auth/server';

export default async function RootPage() {
	const session = await getSession();

	if (!session) return redirect('/login');

	const defaultWorkspace = getDefaultWorkspaceFromSession(session);
	return redirect(`${defaultWorkspace.handle}/links`);
}
