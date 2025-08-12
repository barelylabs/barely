import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { getSession } from '~/auth/server';
import { BioEditor } from './_components/bio-editor';

export const metadata: Metadata = {
	title: 'Bio',
	description: 'Manage your link-in-bio page',
};

export default async function BioPage({ params }: { params: { handle: string } }) {
	const session = await getSession();

	if (!session) {
		redirect('/login');
	}

	const user = session.user;
	const workspace = user.workspaces.find(w => w.handle === params.handle);

	if (!workspace) {
		redirect('/login');
	}

	return (
		<>
			<DashContentHeader title='Bio' subtitle='Customize your link-in-bio page' />
			<BioEditor handle={params.handle} />
		</>
	);
}
