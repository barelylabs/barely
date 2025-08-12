'use client';

import type { BioButtonWithLink } from '@barely/validators';
import { detectLinkType, getLinkTypeInfo } from '@barely/lib/functions/link-type.fns';
import { cn } from '@barely/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

interface BioButtonItemProps {
	button: BioButtonWithLink & { lexoRank: string };
	bioId: string;
	handle: string;
	editable?: boolean;
	onEdit?: () => void;
}

export function BioButtonItem({
	button,
	bioId,
	handle,
	editable = false,
	onEdit,
}: BioButtonItemProps) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: button.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const deleteMutation = useMutation({
		...trpc.bio.removeButton.mutationOptions(),
		onSuccess: () => {
			toast.success('Button deleted');
			void queryClient.invalidateQueries({
				queryKey: trpc.bio.byHandle.queryKey({ handle }),
			});
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to delete button');
		},
	});

	const handleDelete = () => {
		if (confirm('Are you sure you want to delete this button?')) {
			deleteMutation.mutate({ bioId, buttonId: button.id, handle });
		}
	};

	const linkType = button.link ? detectLinkType(button.link.url) : 'url';
	const linkInfo = getLinkTypeInfo(linkType);

	if (!editable) {
		return (
			<div className='rounded-lg border bg-background p-3'>
				<div className='flex items-center gap-3'>
					{linkInfo.icon &&
						(() => {
							const IconComponent = Icon[linkInfo.icon as keyof typeof Icon];
							return IconComponent ?
									<IconComponent className='h-4 w-4 text-muted-foreground' />
								:	null;
						})()}
					<Text className='flex-1'>{button.text}</Text>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				'rounded-lg border bg-background p-3',
				'transition-all',
				isDragging && 'opacity-50 shadow-lg',
			)}
		>
			<div className='flex items-center gap-2'>
				{/* Drag Handle */}
				<button className='cursor-grab touch-none' {...attributes} {...listeners}>
					<Icon.grip className='h-4 w-4 text-muted-foreground' />
				</button>

				{/* Icon & Text */}
				<div className='flex flex-1 items-center gap-2'>
					{linkInfo.icon &&
						(() => {
							const IconComponent = Icon[linkInfo.icon as keyof typeof Icon];
							return IconComponent ?
									<IconComponent className='h-4 w-4 text-muted-foreground' />
								:	null;
						})()}
					<Text className='flex-1'>{button.text}</Text>
				</div>

				{/* Actions */}
				<div className='flex gap-1'>
					<Button size='sm' look='ghost' onClick={onEdit}>
						<Icon.edit className='h-4 w-4' />
					</Button>
					<Button
						size='sm'
						look='ghost'
						onClick={handleDelete}
						loading={deleteMutation.isPending}
					>
						<Icon.trash className='h-4 w-4' />
					</Button>
				</div>
			</div>

			{/* URL Preview */}
			{button.link && (
				<Text variant='xs/normal' className='ml-6 mt-1 text-muted-foreground'>
					{button.link.url}
				</Text>
			)}
		</div>
	);
}
