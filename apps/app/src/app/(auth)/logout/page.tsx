import { redirect } from 'next/navigation';

import { getServerSession } from '@barely/lib/auth';

import Logout from './logout';

async function LogoutPage() {
	const user = await getServerSession();
	if (!user) return redirect('/login');

	return <Logout />;
}

export default LogoutPage;
