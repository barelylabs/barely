import type { User } from '@barely/validators';
import type { AvatarProps } from '@radix-ui/react-avatar';

import { AvatarFallback, AvatarImage, AvatarRoot } from '@barely/ui/avatar';
import { Icon } from '@barely/ui/icon';

interface UserAvatarProps extends AvatarProps {
	user: Pick<User, 'email' | 'image'>;
	fallbackName: string;
}

export function UserAvatar({ user, fallbackName, ...props }: UserAvatarProps) {
	return (
		<AvatarRoot {...props}>
			{user.image ?
				<AvatarImage
					alt='Picture'
					src={user.image}
					className='focus:outline-none focus:ring-0 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
				/>
			:	<AvatarFallback>
					<span className='sr-only'>{fallbackName}</span>
					<Icon.user className='h-4 w-4' />
				</AvatarFallback>
			}
		</AvatarRoot>
	);
}
