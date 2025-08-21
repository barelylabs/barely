import type { SessionUser } from '@barely/auth';
import type { AvatarProps } from '@radix-ui/react-avatar';

import { Avatar, AvatarFallback, AvatarRoot } from '@barely/ui/avatar';
import { Icon } from '@barely/ui/icon';

interface UserAvatarProps extends AvatarProps {
	user: Pick<SessionUser, 'avatarImageS3Key'>;
	fallbackName: string;
}

export function UserAvatar({ user, fallbackName, ...props }: UserAvatarProps) {
	return (
		<AvatarRoot {...props}>
			{user.avatarImageS3Key ?
				<Avatar
					className='h-8 w-8 flex-shrink-0'
					imageWidth={32}
					imageHeight={32}
					imageS3Key={user.avatarImageS3Key}
					// todo: add blur data url (and side trigger logic to create if it doesn't exist)
					priority
				/>
			:	<AvatarFallback>
					<span className='sr-only'>{fallbackName}</span>
					<Icon.user className='h-4 w-4' />
				</AvatarFallback>
			}
		</AvatarRoot>
	);
}
