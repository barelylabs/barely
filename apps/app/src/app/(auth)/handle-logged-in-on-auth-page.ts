import type { SessionWorkspace } from '@barely/auth';
import { redirect } from 'next/navigation';

import { getDefaultWorkspaceFromSession } from '@barely/auth/utils';

import { getSession } from '~/auth/server';

export async function handleLoggedInOnAuthPage(props?: { callbackUrl?: string }) {
	let defaultWorkspace: SessionWorkspace | undefined;

	const session = await getSession();

	if (session?.user && props?.callbackUrl) {
		return redirect(props.callbackUrl);
	}

	try {
		if (session) defaultWorkspace = getDefaultWorkspaceFromSession(session);
		if (defaultWorkspace) return redirect(`/${defaultWorkspace.handle}/links`);
	} catch {
		return;
	}

	return redirect('/');
}
