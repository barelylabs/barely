'use client';

import { useEffect } from 'react';

import { useAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

import { SessionUser } from '@barely/auth/auth-options';
import { User } from '@barely/db';

import { userAtom } from '~/atoms/user.atoms';
import { api } from '~/client/trpc';

const HydrateUserAtom = (props: { initialUser: User | SessionUser }) => {
	// todo - add pusher listener to invalidate when user is updated

	const userQuery = api.edge.user.current.useQuery(undefined, {
		initialData: props.initialUser,
	});

	useHydrateAtoms(new Map([[userAtom, userQuery.data]]));

	const [, setUser] = useAtom(userAtom);

	useEffect(() => {
		if (userQuery.data === undefined) return;
		setUser(userQuery.data);
	}, [userQuery.data, setUser]);

	return null;
};

export default HydrateUserAtom;
