'use client';

import type { ReactNode } from 'react';
import { useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffectOnce } from '@barely/lib/hooks/use-effect-once';
import { useKeyPress } from '@barely/lib/hooks/use-key-press';
import { useUrlMatchesCurrentUrl } from '@barely/lib/hooks/use-url-matches-current-url';
import { cn } from '@barely/lib/utils/cn';
import { elementIsFocused } from '@barely/lib/utils/document';

import type { IconType } from '../../elements/icon';
import { Beacon } from '../../elements/beacon';

export interface NavTabProps {
	tabs: HorizontalTabItemProps[];
	linkShallow?: boolean;
	linkScroll?: boolean;
	actions?: JSX.Element;
}

export function VerticalTabs({
	tabs,
	linkShallow,
	linkScroll,
	actions,
	...props
}: NavTabProps) {
	return (
		<div className='flex-column flex h-10 max-w-full justify-between lg:mb-5'>
			<nav
				className='inline-flex items-center justify-center rounded-md bg-muted px-1 py-4 text-muted-foreground '
				aria-label='Tabs'
				{...props}
			>
				{tabs.map((tab, idx) => (
					<HorizontalTabItem
						{...tab}
						key={idx}
						linkShallow={linkShallow}
						linkScroll={linkScroll}
						leftHref={idx > 0 ? tabs[idx - 1]?.href : tabs[tabs.length - 1]?.href}
						rightHref={idx < tabs.length - 1 ? tabs[idx + 1]?.href : tabs[0]?.href}
					/>
				))}
			</nav>
			{actions && actions}
		</div>
	);
}

export interface HorizontalTabItemProps {
	name: string;
	disabled?: boolean;
	beacon?: boolean;
	className?: string;
	href: string;
	leftHref?: string;
	rightHref?: string;
	linkShallow?: boolean;
	linkScroll?: boolean;
	icon?: IconType;
	avatar?: string;
	count?: ReactNode;
}

export function HorizontalTabItem({
	name,
	href,
	leftHref,
	rightHref,
	linkShallow,
	linkScroll,
	...props
}: HorizontalTabItemProps) {
	const isCurrent = useUrlMatchesCurrentUrl(href);
	const router = useRouter();

	const linkRef = useRef<HTMLAnchorElement>(null);

	useEffectOnce(() => {
		if (isCurrent && linkRef.current) linkRef.current.focus();
	});

	const onLeftKeyDown = useCallback(() => {
		if (isCurrent && leftHref && elementIsFocused(linkRef)) router.push(leftHref);
	}, [isCurrent, leftHref, router]);

	const onRightKeyDown = () => {
		if (isCurrent && rightHref) {
			router.push(rightHref);
		}
	};

	useKeyPress(onLeftKeyDown, 'ArrowLeft');
	useKeyPress(onRightKeyDown, 'ArrowRight');

	return (
		<Link
			key={name}
			ref={linkRef}
			href={href}
			shallow={linkShallow}
			scroll={linkScroll}
			className={cn(
				'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-transparent data-[state=active]:bg-red data-[state=active]:text-foreground data-[state=active]:shadow-sm focus:outline-none focus:ring-transparent focus:ring-offset-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50',
				isCurrent ?
					'bg-background text-accent-foreground'
				:	'text-default hover:bg-subtle hover:text-accent-foreground',
				props.disabled && 'pointer-events-none !opacity-30',
				props.className,
			)}
			data-testid={`horizontal-tab-${name}`}
			aria-current={isCurrent ? 'page' : undefined}
		>
			{props.icon && (
				<props.icon
					className={cn(
						isCurrent ? 'text-emphasis' : 'text-muted group-hover:text-subtle',
						'-ml-0.5 hidden h-4 w-4 sm:inline-block ltr:mr-2 rtl:ml-2',
					)}
					aria-hidden='true'
				/>
			)}
			{name}
			{props.count && (
				<div className='flex items-center justify-center rounded-full bg-blue'>
					{props.count}
				</div>
			)}
			{props.beacon && !isCurrent && <Beacon className='-right-1 -top-1' />}
			{/* {props.beacon && <span>beacon</span>} */}
		</Link>
	);
}
