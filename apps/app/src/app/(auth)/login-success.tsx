import { Text } from '@barely/ui/elements/typography';

interface LoginLinkSentProps {
	identifier: string;
	provider: 'email' | 'sms';
}

const LoginLinkSent = (props: LoginLinkSentProps) => {
	return (
		<div className='mx-auto flex flex-row items-center space-x-2'>
			<div className='content'>
				<Text variant='md/normal'>{`We sent a login link to ${props.identifier}.`}</Text>
			</div>
		</div>
	);
};

export { LoginLinkSent };
