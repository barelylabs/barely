'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Icon } from '@barely/ui';
import { signOut } from 'next-auth/react';

import { SessionUser } from '@barely/auth/auth-options';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@barely/ui/elements/dropdown-menu';

import { UserAvatar } from '~/app/(dash)/components/user-avatar';
import env from '~/env';

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
	user: Pick<SessionUser, 'firstName' | 'lastName' | 'email' | 'type' | 'image'>;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
	const { firstName, lastName } = user;
	const fullName =
		firstName && lastName ? `${firstName} ${lastName}` : firstName ? firstName : null;

	const [signingOut, setSigningOut] = useState(false);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<UserAvatar
					user={{ email: user.email, image: user.image || null }}
					fallbackName={fullName ?? user.email}
					className='h-8 w-8'
				/>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<div className='flex items-center justify-start gap-2 p-2'>
					<div className='flex flex-col space-y-1 leading-none'>
						{fullName && <p className='font-medium'>{fullName}</p>}
						{user.email && (
							<p className='w-[200px] truncate text-sm text-slate-600'>{user.email}</p>
						)}
					</div>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href='/dashboard'>Dashboard</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href='/dashboard/billing'>Billing</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href='/dashboard/settings'>Settings</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className='cursor-pointer'
					onSelect={event => {
						event.preventDefault();
						setSigningOut(true);
						// eslint-disable-next-line @typescript-eslint/no-floating-promises
						signOut({
							callbackUrl: `${env.NEXT_PUBLIC_APP_BASE_URL}/login`,
						});
					}}
				>
					{signingOut && <Icon.spinner className='w-5 h-5 mr-2 animate-spin' />}
					{signingOut ? 'Signing out' : 'Sign out'}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
