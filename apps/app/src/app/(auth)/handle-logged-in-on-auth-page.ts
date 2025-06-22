import type { SessionWorkspace } from '@barely/lib/server/auth';
import { redirect } from 'next/navigation';
import { auth } from '@barely/lib/server/auth';
import { getDefaultWorkspaceOfCurrentUser } from '@barely/lib/server/auth/auth.fns';

export async function handleLoggedInOnAuthPage(props?: { callbackUrl?: string }) {
	let defaultWorkspace: SessionWorkspace | undefined;

	const session = await auth();

	if (session?.user && props?.callbackUrl) {
		return redirect(props.callbackUrl);
	}

	try {
		defaultWorkspace = await getDefaultWorkspaceOfCurrentUser(session);
	} catch {
		return;
	}

	return redirect(`/${defaultWorkspace.handle}/links`);
}
