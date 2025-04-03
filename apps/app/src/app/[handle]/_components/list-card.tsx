'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntersectionObserver } from '@barely/lib/hooks/use-intersection-observer';
import { cn } from '@barely/lib/utils/cn';

import { Button } from '@barely/ui/elements/button';
import {
	Command,
	CommandItem,
	CommandList,
	CommandShortcut,
} from '@barely/ui/elements/command';
import { Icon } from '@barely/ui/elements/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/elements/popover';

interface ItemWithId {
	id: string;
}

interface ListCardProps<T extends ItemWithId> {
	item: T;
	editItem: Awaited<T> | null;
	setEditItem: (item: T | null) => void;
	setShowEditModal?: (show: boolean) => void;
	setShowArchiveModal?: (show: boolean) => void;
	setShowDeleteModal?: (show: boolean) => void;
	children: React.ReactNode;
}

export function ListCard<T extends ItemWithId>({
	item,
	editItem,
	setEditItem,
	setShowEditModal,
	setShowArchiveModal,
	setShowDeleteModal,
	children,
}: ListCardProps<T>) {
	const [showPopover, setShowPopover] = useState(false);

	// handle clicks on the list card
	const itemRef = useRef<HTMLLIElement>(null);
	const entry = useIntersectionObserver(itemRef, {});
	const isVisible = !!entry?.isIntersecting;

	const handleClickOnListItem = useCallback(
		(e: MouseEvent) => {
			const isListCardClick = itemRef.current?.contains(e.target as Node);

			const isAnotherListCardClick =
				!isListCardClick &&
				Array.from(document.querySelectorAll('.list-card')).some(
					card => card !== itemRef.current && card.contains(e.target as Node),
				);

			// check if the clicked element is an <a> or <button> element
			const isExcludedElement =
				(e.target as HTMLElement).tagName.toLowerCase() === 'a' ||
				(e.target as HTMLElement).closest('button') !== null ||
				(e.target as HTMLElement).closest('[role="option"]') !== null;

			const existingModalBackdrop = document.getElementById('modal-backdrop');

			if (isAnotherListCardClick || isExcludedElement || existingModalBackdrop) {
				return;
			}

			if (!isListCardClick) {
				return setEditItem(null);
			}

			if (isListCardClick && !isExcludedElement) {
				return setEditItem(item);
			}
		},
		[setEditItem, item],
	);

	useEffect(() => {
		if (isVisible) {
			document.addEventListener('click', handleClickOnListItem);
		}
		return () => {
			document.removeEventListener('click', handleClickOnListItem);
		};
	}, [isVisible, handleClickOnListItem]);

	// handle keyboard shortcuts - close the popover if it's not currently closed
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.key === 'a' || event.key === 'e' || event.key === 'd') {
				setShowPopover(false);
			}
		};

		document.addEventListener('keydown', handleKeyPress);

		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	return (
		<li
			ref={itemRef}
			className={cn(
				'list-card relative flex flex-row items-center justify-between gap-4 rounded-lg border border-border bg-background p-3 pr-1 transition-all hover:cursor-default hover:shadow-md sm:p-4',
				editItem?.id === item.id && 'border-black shadow-md',
			)}
		>
			{children}
			<Popover
				open={showPopover}
				onOpenChange={open => {
					if (open) setEditItem(item);
					setShowPopover(open);
				}}
			>
				<PopoverTrigger asChild>
					<Button className='py-2' look='ghost' icon>
						<Icon.dotsVertical />
					</Button>
				</PopoverTrigger>

				<PopoverContent className='w-full p-2 sm:w-48' align='end'>
					<Command>
						<CommandList>
							{!!setShowEditModal && (
								<CommandItem
									className='justify-between'
									onSelect={() => {
										setShowPopover(false);
										setShowEditModal(true);
									}}
								>
									<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
										<Icon.edit className='h-4 w-4' />
										<p className='text-sm'>Edit</p>
									</div>
									<CommandShortcut>E</CommandShortcut>
								</CommandItem>
							)}

							{!!setShowArchiveModal && (
								<CommandItem
									className='justify-between'
									onSelect={() => {
										setShowPopover(false);
										setShowArchiveModal(true);
									}}
								>
									<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
										<Icon.archive className='h-4 w-4' />
										<p className='text-sm'>Archive</p>
									</div>
									<CommandShortcut>A</CommandShortcut>
								</CommandItem>
							)}

							{!!setShowDeleteModal && (
								<CommandItem
									className='justify-between'
									onSelect={() => {
										setShowPopover(false);
										setShowDeleteModal(true);
									}}
								>
									<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
										<Icon.trash className='h-4 w-4' />
										<p className='text-sm'>Delete</p>
									</div>
									<CommandShortcut>D</CommandShortcut>
								</CommandItem>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</li>
	);
}
