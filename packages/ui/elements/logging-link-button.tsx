import { LoadingLinkButton } from './button';

export function LoggingLinkButton({ href, label }: { href: string; label: string }) {
	return <LoadingLinkButton href={href}>{label}</LoadingLinkButton>;
}
