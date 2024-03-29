'use server';

import { getUrl } from '@barely/lib/utils/url';
import { signOut } from '@barely/server/auth';

import { wait } from '@barely/utils/wait';

export async function signOutAction() {
	await wait(5000);
	await signOut({
		redirectTo: getUrl('app', 'login'),
	});
}
