'use client';

import { useAtom } from 'jotai';

import { Button } from '@barely/ui/elements/button';

import { showInviteMemberModalAtom } from '~/app/[handle]/settings/team/_components/invite-member-modal';

export function AddMemberButton() {
	const [, showModal] = useAtom(showInviteMemberModalAtom);

	return (
		<Button
			onClick={() => showModal(true)}
			// icon='plus'
			// className='w-full'
		>
			Add member
		</Button>
	);
}
