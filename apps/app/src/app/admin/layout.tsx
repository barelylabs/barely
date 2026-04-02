import { redirect } from 'next/navigation';
import { dbHttp } from '@barely/db/client';
import { Users } from '@barely/db/sql/user.sql';
import { eq } from 'drizzle-orm';

import { getSession } from '~/auth/server';
import { AdminSidebar } from './_components/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const session = await getSession();

	if (!session?.user) {
		return redirect('/login');
	}

	// Check admin status directly from DB
	const dbUser = await dbHttp.query.Users.findFirst({
		where: eq(Users.id, session.user.id),
		columns: { admin: true },
	});

	if (!dbUser?.admin) {
		return redirect('/');
	}

	return (
		<div className='flex h-screen w-full'>
			<AdminSidebar />
			<main className='flex-1 overflow-y-auto p-6'>{children}</main>
		</div>
	);
}
