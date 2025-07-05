'use client';

import type { JsxComponentDescriptor, JsxEditorProps } from '@mdxeditor/editor';
import type { z } from 'zod/v4';
import { useMemo, useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { mdxVideoSchema } from '@barely/lib/mdx';
import {
	Button as EditorButton,
	insertJsx$,
	useMdastNodeUpdater,
	usePublisher,
} from '@mdxeditor/editor';

import { Form, SubmitButton } from '../../../forms/form';
import { TextField } from '../../../forms/text-field';
import { Button } from '../../button';
import { Icon } from '../../icon';
import { Popover, PopoverContent, PopoverTrigger } from '../../popover';
import { H, Text } from '../../typography';
import { VideoPlayer } from '../../video-player';

export const videoJsxComponentDescriptors: JsxComponentDescriptor[] = [
	{
		name: 'VideoPlayer',
		kind: 'flow',
		props: [
			{
				name: 'url',
				type: 'string',
			},
		],
		Editor: props => {
			const videoUrl = props.mdastNode.attributes.find(
				a => a.type === 'mdxJsxAttribute' && a.name === 'url',
			)?.value;

			return (
				<div className='mx-auto h-fit w-full'>
					<div className='flex w-full flex-col'>
						{typeof videoUrl === 'string' && (
							<VideoPlayer className='w-full' controls={false} url={videoUrl} />
						)}
						<VideoEditor {...props} />
					</div>
				</div>
			);
		},
	},
];

export const InsertVideoButton = () => {
	const insertJsx = usePublisher(insertJsx$);
	return (
		<EditorButton
			onClick={() => {
				console.log('insertJsx');
				insertJsx({
					name: 'VideoPlayer',
					kind: 'flow',
					props: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
				});
			}}
		>
			<Icon.video className='h-5 w-5' weight='fill' />
		</EditorButton>
	);
};

export const VideoEditor: React.FC<JsxEditorProps> = ({ mdastNode }) => {
	const [showEditModal, setShowEditModal] = useState(false);

	const updateMdastNode = useMdastNodeUpdater();

	const properties = useMemo(() => {
		const url = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'url',
		)?.value;

		return {
			url,
		};
	}, [mdastNode]);

	const form = useZodForm({
		schema: mdxVideoSchema,
		defaultValues: {
			url: typeof properties.url === 'string' ? properties.url : '',
		},
	});

	const onSubmit = (values: z.infer<typeof mdxVideoSchema>) => {
		const updatedAttributes = Object.entries(values).map(([name, value]) => {
			return {
				type: 'mdxJsxAttribute' as const,
				name,
				value,
			};
		});

		updateMdastNode({
			attributes: updatedAttributes,
		});

		setShowEditModal(false);
	};

	return (
		<div className='flex flex-row items-center justify-between gap-2 rounded-md bg-gray-100 px-2 py-2'>
			<div className='flex flex-row items-center gap-2'>
				<Icon.video className='h-5 w-5' weight='fill' />
				<Text variant='sm/normal' className='m-0'>
					Video
				</Text>
			</div>
			<Popover open={showEditModal} onOpenChange={open => setShowEditModal(open)}>
				<PopoverTrigger asChild>
					<Button size='sm' startIcon='settings' variant='icon' look='ghost' />
				</PopoverTrigger>
				<PopoverContent className='w-full p-2 sm:w-96'>
					<Form form={form} onSubmit={onSubmit} className='flex flex-col gap-2 p-2'>
						<H size='5'>Video Settings</H>
						<TextField label='URL' control={form.control} name='url' />
						<SubmitButton look='secondary' fullWidth>
							Save
						</SubmitButton>
					</Form>
				</PopoverContent>
			</Popover>
		</div>
	);
};
