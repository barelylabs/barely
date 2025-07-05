import { LoadingLinkButton } from './button';

export function mdxLinkButton({ href, label }: { href: string; label: string }) {
	const LinkButton = () => {
		return (
			<div className='flex w-full flex-col items-center'>
				<LoadingLinkButton size='xl' href={href} pill look='brand'>
					{label}
				</LoadingLinkButton>
			</div>
		);
	};

	return {
		LinkButton,
	};
}
