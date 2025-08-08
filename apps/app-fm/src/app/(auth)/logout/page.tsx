import { redirect } from 'next/navigation';

import { getSession } from '~/auth/server';
import { Logout } from './logout';

async function LogoutPage() {
	const session = await getSession();

	if (!session) return redirect('/login');

	return <Logout />;
}

export default LogoutPage;
