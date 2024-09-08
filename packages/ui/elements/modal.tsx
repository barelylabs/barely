// ref: https://github.com/steven-tey/dub/blob/a2a4f43eb5f606eb159a59e882418aefdbee9264/app/ui/modal.tsx
'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@barely/lib/hooks/use-media-query';
import { cn } from '@barely/lib/utils/cn';
import * as Dialog from '@radix-ui/react-dialog';

import type { IconKey } from './icon';
import { Drawer } from '../vaul';
import { Button } from './button';
import { Icon } from './icon';
import { ScrollArea } from './scroll-area';
import { H, Text } from './typography';

interface ModalProps {
	children: ReactNode;
	className?: string;
	dialogOnly?: boolean;
	dismissable?: boolean;
	showModal?: boolean;
	setShowModal?: (show: boolean) => void;
	onOpen?: () => void;
	onClose?: () => void;
	preventDefaultClose?: boolean;
	onAutoFocus?: () => void;
}

function Modal({
	showModal,
	setShowModal,
	onAutoFocus,
	dismissable = true,
	onOpen,
	onClose,
	...props
}: ModalProps) {
	const router = useRouter();

	const closeModal = ({
		dragged,
		byCloseButton,
	}: { dragged?: boolean; byCloseButton?: boolean } = {}) => {
		if (props.preventDefaultClose && !dragged && !byCloseButton) return;

		// fire onClose event if provided
		onClose?.();

		if (setShowModal) {
			setShowModal(false);
		} else {
			router.back();
		}
	};

	const { isMobile } = useMediaQuery();
	if (isMobile && !props.dialogOnly) {
		return (
			<Drawer.Root
				open={showModal ?? true}
				onOpenChange={open => {
					if (open) {
						onOpen?.();
					}
					if (!open) {
						closeModal({ dragged: true });
					}
				}}
				dismissible={dismissable}
				shouldScaleBackground
			>
				<Drawer.Overlay className='fixed inset-0 z-40 bg-muted bg-opacity-10 backdrop-blur' />
				<Drawer.Portal>
					<Drawer.Content
						className={cn(
							'fixed bottom-0 left-0 right-0 z-50 mt-24 h-fit rounded-t-[10-px] border-t border-border bg-background',
							props.className,
						)}
					>
						<div className='sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-inherit'>
							<div className='my-3 h-1 w-12 rounded-full bg-border' />
						</div>
						{props.children}
					</Drawer.Content>
					<Drawer.Overlay />
				</Drawer.Portal>
			</Drawer.Root>
		);
	}

	return (
		<Dialog.Root
			open={showModal ?? true}
			onOpenChange={open => {
				console.log('onOpenChange modal >> ', open);
				if (open) {
					console.log('onOpenChange modal >> open');
					onOpen?.();
				}
				if (!open) {
					console.log('onOpenChange modal >> close');
					closeModal();
				}
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay
					id='modal-backdrop' // for detecting when there's an active opened modal
					className='animate-fade-in fixed inset-0 z-40 bg-slate-100 bg-opacity-20 backdrop-blur-md dark:bg-slate-800 dark:bg-opacity-80'
				/>

				<Dialog.Content
					className={cn(
						'animate-scale-in fixed inset-0 z-40 m-auto flex h-fit max-h-[90vh] w-full max-w-screen-lg flex-col overflow-auto border border-border bg-inherit p-0 shadow-xl sm:rounded-2xl md:overflow-hidden',
						'focus:outline-none',
						props.className,
					)}
					onOpenAutoFocus={e => {
						if (onAutoFocus) {
							e.preventDefault();
							onAutoFocus();
						}
					}}
					tabIndex={undefined} // fixme: when tabIndex was set to -1 (default by radix), the modal would focus between every input on tab. This is a temporary fix
				>
					<Button
						startIcon='x'
						variant='icon'
						look='ghost'
						size='sm'
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus={false}
						className='absolute right-1 top-1 z-20'
						pill
						onClick={() => {
							closeModal({
								byCloseButton: true,
							});
						}}
					/>

					<div className='grid w-full max-w-full'>
						<ScrollArea hideScrollbar className='md:max-h-[90vh]'>
							<div className='flex w-full max-w-full flex-col'>{props.children}</div>
						</ScrollArea>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

interface ModalHeaderProps {
	icon?: IconKey;
	iconOverride?: ReactNode;
	title?: ReactNode;
	subtitle?: ReactNode;
	children?: ReactNode;
}

function ModalHeader(props: ModalHeaderProps) {
	const IconComponent = props.icon ? Icon[props.icon] : null;

	return (
		<div className='z-10 flex flex-col items-center justify-center gap-3 border-b border-border bg-background px-6 py-6 text-center sm:px-10 md:sticky md:top-0'>
			{/* <div className='flex flex-row items-center justify-center gap-3'></div> */}
			{props.iconOverride ?
				props.iconOverride
			: IconComponent ?
				<IconComponent className='h-10 w-10' />
			:	null}

			{props.title ?
				<H size='4'>{props.title}</H>
			:	null}
			{props.subtitle ?
				<Text variant='sm/normal'>{props.subtitle}</Text>
			:	null}
			{props.children}
		</div>
	);
}

interface ModalBodyProps {
	children?: ReactNode;
	className?: string;
}

function ModalBody(props: ModalBodyProps) {
	return (
		<div className={cn('flex max-w-full flex-col gap-3 bg-subtle p-6', props.className)}>
			{props.children}
		</div>
	);
}

function ModalFooter(props: { children?: ReactNode }) {
	return (
		<div className='z-10 flex flex-col gap-3 border-t bg-background p-6 text-center md:sticky md:bottom-0'>
			{props.children}
		</div>
	);
}

export { Modal, ModalHeader, ModalBody, ModalFooter };
