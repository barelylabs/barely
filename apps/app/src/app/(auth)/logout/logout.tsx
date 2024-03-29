'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@barely/server/auth/auth.react';

export function Logout({ redirect }: { redirect?: string }) {
	const router = useRouter();

	useEffect(() => {
		if (!router) return;
		signOut()
			.then(() => router.push(redirect ?? '/login'))
			.catch(err => console.error(err));
	}, [router, redirect]);

	return <>...logging you out</>;
}
