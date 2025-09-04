'use client';

import type { BioBlockType } from '@barely/const';
import {
	FileText,
	Image,
	LayoutPanelLeft,
	Link2,
	Mail,
	ShoppingCart,
} from 'lucide-react';

import { Button } from '@barely/ui/button';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';

interface AddBlockModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAddBlock: (type: BioBlockType) => void;
}

export function AddBlockModal({ open, onOpenChange, onAddBlock }: AddBlockModalProps) {
	const handleAddBlock = (type: BioBlockType) => {
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
						look='outline'
						size='lg'
						onClick={() => handleAddBlock('links')}
						className='flex h-auto w-full items-center justify-start gap-3 bg-background p-4 hover:bg-gray-50'
					>
						<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100'>
							<Link2 className='h-5 w-5 text-green-600' />
						</div>
						<div className='flex-1 text-left'>
							<Text variant='md/medium' className='font-medium'>
								Links
							</Text>
							<Text variant='sm/normal' className='text-gray-500'>
								Add buttons that link to your content
							</Text>
						</div>
					</Button>

					<Button
						look='outline'
						size='lg'
						onClick={() => handleAddBlock('markdown')}
						className='flex h-auto w-full items-center justify-start gap-3 bg-background p-4 hover:bg-gray-50'
					>
						<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100'>
							<FileText className='h-5 w-5 text-purple-600' />
						</div>
						<div className='flex-1 text-left'>
							<Text variant='md/medium' className='font-medium'>
								Markdown
							</Text>
							<Text variant='sm/normal' className='text-gray-500'>
								Add rich text content with formatting
							</Text>
						</div>
					</Button>

					<Button
						look='outline'
						size='lg'
						onClick={() => handleAddBlock('image')}
						className='flex h-auto w-full items-center justify-start gap-3 bg-background p-4 hover:bg-gray-50'
					>
						<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-pink-100'>
							<Image className='h-5 w-5 text-pink-600' />
						</div>
						<div className='flex-1 text-left'>
							<Text variant='md/medium' className='font-medium'>
								Image
							</Text>
							<Text variant='sm/normal' className='text-gray-500'>
								Display photos or graphics
							</Text>
						</div>
					</Button>

					<Button
						look='outline'
						size='lg'
						onClick={() => handleAddBlock('twoPanel')}
						className='flex h-auto w-full items-center justify-start gap-3 bg-background p-4 hover:bg-gray-50'
					>
						<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100'>
							<LayoutPanelLeft className='h-5 w-5 text-orange-600' />
						</div>
						<div className='flex-1 text-left'>
							<Text variant='md/medium' className='font-medium'>
								Two Panel
							</Text>
							<Text variant='sm/normal' className='text-gray-500'>
								Image and text side by side with CTA
							</Text>
						</div>
					</Button>

					<Button
						look='outline'
						size='lg'
						onClick={() => handleAddBlock('cart')}
						className='flex h-auto w-full items-center justify-start gap-3 bg-background p-4 hover:bg-gray-50'
					>
						<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100'>
							<ShoppingCart className='h-5 w-5 text-indigo-600' />
						</div>
						<div className='flex-1 text-left'>
							<Text variant='md/medium' className='font-medium'>
								Cart
							</Text>
							<Text variant='sm/normal' className='text-gray-500'>
								Sell products with a checkout funnel
							</Text>
						</div>
					</Button>

					<Button
						look='outline'
						size='lg'
						onClick={() => handleAddBlock('contactForm')}
						className='flex h-auto w-full items-center justify-start gap-3 bg-background p-4 hover:bg-gray-50'
					>
						<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100'>
							<Mail className='h-5 w-5 text-blue-600' />
						</div>
						<div className='flex-1 text-left'>
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
