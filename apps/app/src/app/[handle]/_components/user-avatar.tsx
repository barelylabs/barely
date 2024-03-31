import type { User } from '@barely/lib/server/routes/user/user.schema';
import type { AvatarProps } from '@radix-ui/react-avatar';

import { AvatarFallback, AvatarImage, AvatarRoot } from '@barely/ui/elements/avatar';
import { Icon } from '@barely/ui/elements/icon';

interface UserAvatarProps extends AvatarProps {
	user: Pick<User, 'email' | 'image'>;
	fallbackName: string;
}

export function UserAvatar({ user, fallbackName, ...props }: UserAvatarProps) {
	return (
		<AvatarRoot {...props}>
			{user.image ? (
				<AvatarImage alt='Picture' src={user.image} />
			) : (
				<AvatarFallback>
					<span className='sr-only'>{fallbackName ?? user.email}</span>
					<Icon.user className='h-4 w-4' />
				</AvatarFallback>
			)}
		</AvatarRoot>
	);
}
