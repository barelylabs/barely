'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWorkspaces } from '@barely/lib/hooks/use-workspaces';
import { getAbsoluteUrl } from '@barely/lib/utils/url';
// import { APP_BASE_URL } from "@barely/utils/constants";
import { signOut } from 'next-auth/react';

// import { signOut } from '@barely/server/auth';

// import { experimental_useFormStatus as useFormStatus } from 'react-dom';

// import { signOut } from 'next-auth/react';

import { useUser } from '@barely/hooks/use-user';

import { Avatar } from '@barely/ui/elements/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@barely/ui/elements/dropdown-menu';
import { Icon } from '@barely/ui/elements/icon';

// export function UserAccountNav({ user }: UserAccountNavProps) {
export function UserAccountNav() {
	const user = useUser();
	const allWorkspaces = useWorkspaces();

	const personalAccount = allWorkspaces.find(
		workspace => workspace.handle === user.handle,
	);

	const { firstName, lastName } = user;
	const fullName =
		firstName && lastName ? `${firstName} ${lastName}`
		: firstName ? firstName
		: null;

	const [signingOut, setSigningOut] = useState(false);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='rounded-full focus:outline-none focus:ring-0 focus:ring-ring'>
				<Avatar
					className='h-6 w-6'
					imageWidth={28}
					imageHeight={28}
					imageS3Key={personalAccount?.avatarImageS3Key}
					priority
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
				{/* <DropdownMenuItem asChild>
					<Link href={`/${user.handle}/`}>Dashboard</Link>
				</DropdownMenuItem> */}
				{/* <DropdownMenuItem asChild>
					<Link href={`/${user.handle}/billing`}>Billing</Link>
				</DropdownMenuItem> */}
				<DropdownMenuItem asChild>
					<Link href={`/${user.handle}/settings`}>Personal Settings</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className='cursor-pointer'
					onSelect={event => {
						event.preventDefault();
						setSigningOut(true);
						signOut({
							callbackUrl: getAbsoluteUrl('app', 'login'),
						}).catch(err => console.error(err));
					}}
				>
					{signingOut && <Icon.spinner className='mr-2 h-5 w-5 animate-spin' />}
					{signingOut ? 'Signing out' : 'Sign out'}
				</DropdownMenuItem>
				{/* <form
					action={async () => {
						// setSigningOut(true);

						await signOutAction();
						// setSigningOut(false);
					}}
				>
					<DropdownMenuItem asChild>
						<SignOutButton />
					</DropdownMenuItem>
				</form> */}
				{/* <SignOutButtonForm /> */}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// export function SignOutButton() {
// 	const { pending } = useFormStatus();

// 	return (
// 		<button type='submit' aria-disabled={pending}>
// 			{pending && <Icon.spinner className='mr-2 h-5 w-5 animate-spin' />}
// 			{pending ? 'Signing out' : 'Sign out'}
// 		</button>
// 	);
// }
