'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { authClient } from '~/auth/client';

export function Logout({ redirect }: { redirect?: string }) {
	const router = useRouter();

	// useEffect(() => {
	// 	signOut()
	// 		.then(() => router.push(redirect ?? '/login'))
	// 		.catch(err => console.error(err));
	// }, [router, redirect]);
	useEffect(() => {
		authClient
			.signOut()
			.then(() => router.push(redirect ?? '/login'))
			.catch(err => console.error(err));
	}, [router, redirect]);

	return <>...logging you out</>;
}
