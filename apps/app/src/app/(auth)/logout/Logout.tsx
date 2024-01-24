'use client';

import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Logout({ session }: { session: Session | null }) {
	const router = useRouter();
	const callbackUrl = '/signin';

	useEffect(() => {
		if (!session) {
			console.log('there is no user signed in.');
			router.push(callbackUrl);
		}

		signOut({ redirect: false, callbackUrl }).then(data => router.push(data.url));
	}, [session, router]);
	return <></>;
}
