'use client';

import type { BioButtonWithLink } from '@barely/validators';
import { useEffect } from 'react';
import { useZodForm } from '@barely/hooks';
import {
	detectLinkType,
	formatLinkUrl,
	suggestLinkText,
} from '@barely/lib/functions/link-type.fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Button } from '@barely/ui/button';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';

interface BioButtonModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bioId: string;
	handle: string;
	button?: BioButtonWithLink | null;
}

export function BioButtonModal({
	open,
	onOpenChange,
	bioId,
	handle,
	button,
}: BioButtonModalProps) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const isEditing = !!button;

	const formSchema = z.object({
		text: z.string().min(1, 'Button text is required'),
		url: z.string().min(1, 'URL is required'),
	});

	const form = useZodForm({
		schema: formSchema,
		// Key the form to force recreation when button changes
		key: button?.id ?? 'new',
		defaultValues: {
			text: button?.text ?? '',
			url: button?.link?.url ?? button?.email ?? button?.phone ?? '',
		},
	});

	// Watch URL to auto-suggest text
	const watchUrl = form.watch('url');
	useEffect(() => {
		if (!isEditing && watchUrl && !form.watch('text')) {
			const linkType = detectLinkType(watchUrl);
			const suggestedText = suggestLinkText(watchUrl, linkType);
			if (suggestedText) {
				form.setValue('text', suggestedText);
			}
		}
	}, [watchUrl, isEditing, form]);

	const createMutation = useMutation(
		trpc.bio.addButton.mutationOptions({
			onSuccess: () => {
				toast.success('Button added successfully');
				void queryClient.invalidateQueries({
					queryKey: trpc.bio.byHandle.queryKey({ handle }),
				});
				onOpenChange(false);
				form.reset();
			},
			onError: error => {
				toast.error(error.message ?? 'Failed to add button');
			},
		}),
	);

	const updateMutation = useMutation(
		trpc.bio.updateButton.mutationOptions({
			onSuccess: () => {
				toast.success('Button updated successfully');
				void queryClient.invalidateQueries({
					queryKey: trpc.bio.byHandle.queryKey({ handle }),
				});
				onOpenChange(false);
			},
			onError: error => {
				toast.error(error.message ?? 'Failed to update button');
			},
		}),
	);

	const handleSubmit = (data: z.infer<typeof formSchema>) => {
		const formattedUrl = formatLinkUrl(data.url);
		const linkType = detectLinkType(formattedUrl);

		if (isEditing && button) {
			let updateData: any = {
				id: button.id,
				handle,
				text: data.text,
			};

			if (linkType === 'email') {
				updateData.email = formattedUrl;
			} else if (linkType === 'phone') {
				updateData.phone = formattedUrl;
			} else {
				// For URL types, simplified - in production you'd handle link creation
				updateData.text = data.text;
			}

			updateMutation.mutate(updateData);
		} else {
			let buttonData: any = {
				text: data.text,
				bioId,
				handle,
			};

			if (linkType === 'email') {
				buttonData.email = formattedUrl;
			} else if (linkType === 'phone') {
				buttonData.phone = formattedUrl;
			} else {
				// For all other types, simplified
				buttonData.text = data.text;
			}

			createMutation.mutate(buttonData);
		}
	};

	// Note: Suggestions feature can be added back when the API is ready
	const suggestions: { text: string; url: string }[] = [];

	const handleUseSuggestion = (suggestion: { text: string; url: string }) => {
		form.setValue('text', suggestion.text);
		form.setValue('url', suggestion.url);
	};

	return (
		<Modal showModal={open} setShowModal={onOpenChange}>
			<ModalBody>
				<ModalHeader>
					<h2 className='text-lg font-semibold'>
						{isEditing ? 'Edit Button' : 'Add Button'}
					</h2>
				</ModalHeader>

				<Form form={form} onSubmit={handleSubmit}>
					<div className='space-y-4'>
						<TextField
							control={form.control}
							name='url'
							label='URL'
							placeholder='https://example.com or social handle'
							description='Enter a URL, email, phone, or social media handle'
						/>

						<TextField
							control={form.control}
							name='text'
							label='Button Text'
							placeholder='Click me'
							description='The text displayed on the button'
						/>

						{/* Suggestions - commented out for now until API is ready */}
						{!isEditing && suggestions && suggestions.length > 0 && (
							<div className='space-y-2'>
								<p className='text-sm font-medium'>Suggestions</p>
								<div className='space-y-1'>
									{suggestions.slice(0, 5).map((suggestion, index) => (
										<button
											key={index}
											type='button'
											onClick={() => handleUseSuggestion(suggestion)}
											className='w-full rounded-md border p-2 text-left text-sm hover:bg-muted'
										>
											<span className='font-medium'>{suggestion.text}</span>
											<span className='ml-2 text-muted-foreground'>
												{suggestion.url.length > 30 ?
													`${suggestion.url.slice(0, 30)}...`
												:	suggestion.url}
											</span>
										</button>
									))}
								</div>
							</div>
						)}

						<div className='flex justify-end gap-2'>
							<Button type='button' look='outline' onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<SubmitButton
								loading={isEditing ? updateMutation.isPending : createMutation.isPending}
							>
								{isEditing ? 'Update Button' : 'Add Button'}
							</SubmitButton>
						</div>
					</div>
				</Form>
			</ModalBody>
		</Modal>
	);
}
