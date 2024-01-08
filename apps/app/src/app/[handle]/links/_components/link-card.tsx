import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Link as LinkProps } from '@barely/server/link.schema';
import { useAtom } from 'jotai';

import { useIntersectionObserver } from '@barely/hooks/use-intersection-observer';

import { Badge } from '@barely/ui/elements/badge';
import { BlurImage } from '@barely/ui/elements/blur-image';
import { Button } from '@barely/ui/elements/button';
import {
	Command,
	CommandItem,
	CommandList,
	CommandShortcut,
} from '@barely/ui/elements/command';
import { CopyButton } from '@barely/ui/elements/copy-button';
import { Icon } from '@barely/ui/elements/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/elements/popover';
import { Text } from '@barely/ui/elements/typography';

import { cn } from '@barely/utils/cn';
import { truncate } from '@barely/utils/text';

import { showArchiveLinkModalAtom } from '~/app/[handle]/links/_components/archive-link-modal';
import {
	editLinkAtom,
	showLinkModalAtom,
} from '~/app/[handle]/links/_components/link-modal';

// import Link from 'next/link';

export function LinkCard(props: { link: LinkProps; key: string }) {
	const [editLink, setEditLink] = useAtom(editLinkAtom);
	const [, setShowArchiveLinkModal] = useAtom(showArchiveLinkModalAtom);
	const [, setShowEditLinkModal] = useAtom(showLinkModalAtom);

	// handle clicks on the link card
	const linkRef = useRef<HTMLLIElement>(null);
	const entry = useIntersectionObserver(linkRef, {});
	const isVisible = !!entry?.isIntersecting;

	const handleClickOnLinkCard = useCallback(
		(e: MouseEvent) => {
			const isLinkCardClick =
				linkRef.current && linkRef.current.contains(e.target as Node);

			const isAnotherLinkCardClick =
				!isLinkCardClick &&
				Array.from(document.querySelectorAll('.link-card')).some(
					card => card !== linkRef.current && card.contains(e.target as Node),
				);

			// check if the clicked element is an <a> or <button> element
			const isExcludedElement =
				(e.target as HTMLElement).tagName.toLowerCase() === 'a' ||
				(e.target as HTMLElement).closest('button') !== null ||
				(e.target as HTMLElement).closest('[role="option"]') !== null;

			const existingModalBackdrop = document.getElementById('modal-backdrop');

			if (isAnotherLinkCardClick || isExcludedElement || existingModalBackdrop) {
				return;
			}

			if (!isLinkCardClick) {
				return setEditLink(null);
			}

			if (isLinkCardClick && !isExcludedElement) {
				setEditLink(props.link);
			}
		},
		[linkRef, setEditLink, props.link],
	);

	useEffect(() => {
		if (isVisible) {
			document.addEventListener('click', handleClickOnLinkCard);
		}
		return () => {
			document.removeEventListener('click', handleClickOnLinkCard);
		};
	}, [isVisible, handleClickOnLinkCard]);

	const [showPopover, setShowPopover] = useState(false);

	// handle keyboard shortcuts - close the popover if it's not currently closed
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.key === 'a' || event.key === 'e') {
				setShowPopover(false);
			}
		};

		document.addEventListener('keydown', handleKeyPress);

		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	return (
		<>
			<li
				ref={linkRef}
				className={cn(
					'link-card relative flex flex-row items-center justify-between gap-4 rounded-lg border border-border bg-background p-3 pr-1 transition-all hover:cursor-default hover:shadow-md sm:p-4',
					editLink?.id === props.link.id && 'border-black shadow-md',
				)}
			>
				<div className='flex flex-grow flex-row items-center gap-4'>
					{props.link.favicon ? (
						<BlurImage
							src={props.link.favicon}
							alt='Link'
							className='h-8 w-8 sm:h-10 sm:w-10'
							width={20}
							height={20}
						/>
					) : (
						<Icon.link className='h-8 w-8 sm:h-10 sm:w-10' />
					)}

					<div className='flex flex-col items-start gap-1'>
						<div className='flex flex-row items-center gap-2'>
							<a href={`https://${props.link.domain}/${props.link.key}`}>
								<Text
									variant='md/semibold'
									className='text-blue-800'
								>{`${props.link.domain}/${props.link.key}`}</Text>
							</a>
							<CopyButton text={`https://${props.link.domain}/${props.link.key}`} />
						</div>

						<a href={props.link.url} target='_blank' rel='noreferrer'>
							<Text variant='sm/medium' className='hover:underline'>
								{truncate(props.link.url, 50)}
							</Text>
						</a>
					</div>
				</div>

				<Link
					href={`/${props.link.handle}/links/stats?assetId=${props.link.id}`}
					passHref
				>
					<Badge size='md' icon={'stat'} variant='muted' rectangle asButton>
						{props.link.clicks} clicks
					</Badge>
				</Link>

				<Popover
					open={showPopover}
					onOpenChange={open => {
						if (open) setEditLink(props.link);
						setShowPopover(open);
					}}
				>
					<PopoverTrigger asChild>
						<Button className='py-2' variant='ghost' icon>
							<Icon.dotsVertical />
						</Button>
					</PopoverTrigger>

					<PopoverContent className='w-full p-2 sm:w-48' align='end'>
						<Command>
							<CommandList>
								<CommandItem
									className='justify-between'
									onSelect={() => {
										setShowPopover(false);
										setShowEditLinkModal(true);
									}}
								>
									<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
										<Icon.edit className='h-4 w-4 ' />
										<p className='text-sm'>Edit</p>
									</div>
									<CommandShortcut>E</CommandShortcut>
								</CommandItem>

								<CommandItem
									className='justify-between'
									onSelect={() => {
										setShowPopover(false);
										setShowArchiveLinkModal(true);
									}}
								>
									<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
										<Icon.archive className='h-4 w-4 ' />
										<p className='text-sm'>Archive</p>
									</div>
									<CommandShortcut>A</CommandShortcut>
								</CommandItem>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</li>
		</>
	);
}
