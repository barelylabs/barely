'use client';

import { useWorkspaceIsPersonal } from '@barely/lib/hooks/use-workspace';
import { useAtom } from 'jotai';

import { Button } from '@barely/ui/elements/button';

import { showInviteMemberModalAtom } from '~/app/[handle]/settings/team/_components/invite-member-modal';

export function AddMemberButton() {
	const [, showModal] = useAtom(showInviteMemberModalAtom);

	const isPersonal = useWorkspaceIsPersonal();

	if (isPersonal) return null;

	return <Button onClick={() => showModal(true)}>Add member</Button>;
}
