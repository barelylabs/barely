'use client';

import { Link2, Mail } from 'lucide-react';

import { Button } from '@barely/ui/button';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';

interface AddBlockModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAddBlock: (type: 'links' | 'contactForm') => void;
}

export function AddBlockModal({ open, onOpenChange, onAddBlock }: AddBlockModalProps) {
	const handleAddBlock = (type: 'links' | 'contactForm') => {
		onAddBlock(type);
		onOpenChange(false);
	};

	return (
		<Modal showModal={open} setShowModal={onOpenChange}>
			<ModalHeader
				title='Add Block'
				subtitle='Choose the type of block you want to add to your bio page'
			/>
			<ModalBody>
				<div className='grid gap-3'>
					<Button
						variant='outline'
						size='lg'
						onClick={() => handleAddBlock('links')}
						className='flex h-auto items-center justify-start gap-3 p-4'
					>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100'>
							<Link2 className='h-5 w-5 text-green-600' />
						</div>
						<div className='text-left'>
							<Text variant='md/medium' className='font-medium'>
								Links
							</Text>
							<Text variant='sm/normal' className='text-gray-500'>
								Add buttons that link to your content
							</Text>
						</div>
					</Button>

					<Button
						variant='outline'
						size='lg'
						onClick={() => handleAddBlock('contactForm')}
						className='flex h-auto items-center justify-start gap-3 p-4'
					>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100'>
							<Mail className='h-5 w-5 text-blue-600' />
						</div>
						<div className='text-left'>
							<Text variant='md/medium' className='font-medium'>
								Contact Form
							</Text>
							<Text variant='sm/normal' className='text-gray-500'>
								Let visitors send you messages
							</Text>
						</div>
					</Button>
				</div>
			</ModalBody>
		</Modal>
	);
}
