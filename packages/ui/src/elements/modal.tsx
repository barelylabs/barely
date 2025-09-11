// ref: https://github.com/steven-tey/dub/blob/a2a4f43eb5f606eb159a59e882418aefdbee9264/app/ui/modal.tsx
'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@barely/hooks';
import { cn } from '@barely/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';

import type { IconKey } from './icon';
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
		if (props.preventDefaultClose && !dragged && !byCloseButton) {
			console.log('closeModal >> preventDefaultClose', props.preventDefaultClose);
			console.log('closeModal >> dragged', dragged);
			console.log('closeModal >> byCloseButton', byCloseButton);
			return;
		}

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
				<Drawer.Overlay className='fixed inset-0 z-50 bg-muted bg-opacity-10 backdrop-blur' />
				<Drawer.Portal>
					<Drawer.Content className='fixed bottom-0 left-0 right-0 z-[60] mt-24 flex max-h-[95dvh] flex-col rounded-t-[10-px] border-t border-border bg-background'>
						<div className='flex w-full shrink-0 items-center justify-center rounded-t-[10px] bg-inherit'>
							<div className='my-3 h-1 w-12 rounded-full bg-border' />
						</div>
						<div className='overflow-y-auto'>
							<div className={cn('mx-auto', props.className)}>{props.children}</div>
						</div>
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
					className='animate-fade-in fixed inset-0 z-50 bg-slate-100 bg-opacity-20 backdrop-blur-md dark:bg-slate-800 dark:bg-opacity-80'
				/>

				<Dialog.Content
					className={cn(
						'animate-scale-in fixed inset-0 z-[60] m-auto flex h-fit max-h-[90vh] w-full max-w-screen-md flex-col overflow-auto border border-border bg-inherit p-0 shadow-xl sm:rounded-2xl md:overflow-hidden',
						'focus:outline-none',
						props.className,
					)}
					onOpenAutoFocus={e => {
						if (onAutoFocus) {
							e.preventDefault();
							onAutoFocus();
						}
					}}
					onPointerDownOutside={e => {
						// Prevent closing when clicking on password manager overlays
						const target = e.target as HTMLElement;

						// Check if the click target is a password manager extension element
						// Common selectors for popular password managers
						if (
							target.closest('[data-lastpass-icon-root]') || // LastPass
							target.closest('[data-1password]') || // 1Password
							target.closest('[data-bitwarden-watching]') || // Bitwarden
							target.closest('[data-dashlane-label]') || // Dashlane
							target.closest('com-1password-button') || // 1Password button element
							target.closest('div[style*="z-index: 2147483"]') || // Common high z-index for extensions
							target.tagName === 'COM-1PASSWORD-BUTTON' || // 1Password custom element
							target.id.includes('com-1password') || // 1Password elements
							target.className.includes('password-manager') // Generic class some extensions use
						) {
							e.preventDefault();
							return;
						}

						// Also prevent closing if preventDefaultClose is set and not a close button click
						if (props.preventDefaultClose) {
							e.preventDefault();
							return;
						}
					}}
					onInteractOutside={e => {
						// Additional check for interact events
						const target = e.target as HTMLElement;

						if (
							target.closest('[data-lastpass-icon-root]') ||
							target.closest('[data-1password]') ||
							target.closest('[data-bitwarden-watching]') ||
							target.closest('[data-dashlane-label]') ||
							target.closest('com-1password-button') ||
							target.closest('div[style*="z-index: 2147483"]') ||
							target.tagName === 'COM-1PASSWORD-BUTTON' ||
							target.id.includes('com-1password') ||
							target.className.includes('password-manager')
						) {
							e.preventDefault();
							return;
						}

						if (props.preventDefaultClose) {
							e.preventDefault();
							return;
						}
					}}
					tabIndex={undefined} // fixme: when tabIndex was set to -1 (default by radix), the modal would focus between every input on tab. This is a temporary fix
				>
					<Button
						startIcon='x'
						variant='icon'
						look='ghost'
						size='sm'
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
	justify?: 'center' | 'left';
}

function ModalHeader(props: ModalHeaderProps) {
	const IconComponent = props.icon ? Icon[props.icon] : null;

	return (
		<div
			className={cn(
				'z-10 flex flex-col items-center justify-start gap-3 border-b border-border bg-background px-6 py-6 text-center sm:px-10 md:sticky md:top-0',
				props.justify === 'left' && 'items-start',
			)}
		>
			{/* <div className='flex flex-row items-center justify-center gap-3'></div> */}
			<div
				className={cn(
					'flex items-center',
					props.justify === 'left' ? 'flex-row gap-3' : 'flex-col gap-2',
				)}
			>
				{props.iconOverride ?? (IconComponent && <IconComponent className='h-8 w-8' />)}

				{props.title ?
					<H size='5'>{props.title}</H>
				:	null}
			</div>
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
