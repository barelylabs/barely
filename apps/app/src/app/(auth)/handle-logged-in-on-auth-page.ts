import type { SessionWorkspace } from '@barely/auth';
import { redirect } from 'next/navigation';

import { getDefaultWorkspaceFromSession } from '@barely/auth/utils';

import { getSession } from '~/auth/server';

export async function handleLoggedInOnAuthPage(props?: { callbackUrl?: string }) {
	let defaultWorkspace: SessionWorkspace | null = null;

	const session = await getSession();

	if (session?.user && props?.callbackUrl) {
		return redirect(props.callbackUrl);
	}

	if (session) defaultWorkspace = getDefaultWorkspaceFromSession(session);
	if (defaultWorkspace) return redirect(`/${defaultWorkspace.handle}/fm`);
	// try {
	// 	console.log('defaultWorkspace.handle', defaultWorkspace?.handle);
	// 	console.log('defaultWorkspace', defaultWorkspace);
	// } catch (e) {
	// 	console.log('defaultWorkspace error', defaultWorkspace);
	// 	console.log('defaultWorkspace error', e);
	// 	return;
	// }

	// Don't redirect to root if no session - this prevents redirect loops
	return;
}
