'use client';

import { useToast } from '@barely/toast';
import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
} from '@heroicons/react/24/solid';

import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from './toast';

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider swipeDirection='right'>
			{toasts.map(function ({ id, icon, title, description, action, ...props }) {
				return (
					<Toast key={id} {...props}>
						<div className='flex flex-row items-center justify-start gap-2'>
							{icon === 'success' ?
								<CheckCircleIcon className='h-5 w-5' />
							: icon === 'error' ?
								<ExclamationCircleIcon className='h-5 w-5' />
							: icon === 'warning' ?
								<ExclamationTriangleIcon className='h-5 w-5' />
							:	<InformationCircleIcon className='h-5 w-5' />}

							<div className='grid gap-1'>
								{title && <ToastTitle>{title}</ToastTitle>}
								{description && <ToastDescription>{description}</ToastDescription>}
							</div>
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}
