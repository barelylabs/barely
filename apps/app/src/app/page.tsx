import { redirect } from 'next/navigation';
import { auth } from '@barely/lib/server/auth';
import { getDefaultWorkspaceOfCurrentUser } from '@barely/lib/server/auth/auth.fns';

export default async function RootPage() {
	const session = await auth();

	if (!session) return redirect('/login');

	const defaultWorkspace = await getDefaultWorkspaceOfCurrentUser();
	return redirect(`${defaultWorkspace.handle}/links`);
}
