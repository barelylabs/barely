'use client';

import type { JsxComponentDescriptor, JsxEditorProps } from '@mdxeditor/editor';
import type { z } from 'zod';
import { useMemo, useState } from 'react';
import { useDebounce } from '@barely/lib/hooks/use-debounce';
import { useWorkspaceAssets } from '@barely/lib/hooks/use-workspace-assets';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { mdxAssetButtonSchema } from '@barely/lib/server/mdx/mdx.schema';
import {
	insertJsx$,
	Button as ToolbarButton,
	useMdastNodeUpdater,
	usePublisher,
} from '@mdxeditor/editor';

import { Form, SubmitButton } from '../../../forms';
import { TextField } from '../../../forms/text-field';
import { Button } from '../../button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../../command';
import { Icon } from '../../icon';
import { Popover, PopoverContent, PopoverTrigger } from '../../popover';
import { H, Text } from '../../typography';

export const buttonComponentDescriptors: JsxComponentDescriptor[] = [
	{
		name: 'AssetButton',
		kind: 'flow',
		props: [
			{
				name: 'assetId',
				type: 'string',
			},
			{
				name: 'assetName',
				type: 'string',
			},
			{
				name: 'assetType',
				type: 'string',
			},
			{
				name: 'label',
				type: 'string',
			},
		],
		Editor: props => {
			const assetId = props.mdastNode.attributes.find(
				a => a.type === 'mdxJsxAttribute' && a.name === 'assetId',
			)?.value;

			// const assetName = props.mdastNode.attributes.find(
			//     a => a.type === 'mdxJsxAttribute' && a.name === 'assetName',
			// )?.value;

			// const assetType = props.mdastNode.attributes.find(
			//     a => a.type === 'mdxJsxAttribute' && a.name === 'assetType',
			// )?.value;

			const label = props.mdastNode.attributes.find(
				a => a.type === 'mdxJsxAttribute' && a.name === 'label',
			)?.value;

			return (
				<div className='mx-auto h-fit w-full py-4'>
					<div className='flex w-full flex-col'>
						{typeof assetId === 'string' && (
							<Button fullWidth>{typeof label === 'string' ? label : ''}</Button>
						)}
						<AssetButtonEditor {...props} />
					</div>
				</div>
			);
		},
	},
];

export const InsertAssetButtonButton = () => {
	const insertJsx = usePublisher(insertJsx$);
	return (
		<ToolbarButton
			onClick={() => {
				insertJsx({
					name: 'AssetButton',
					kind: 'flow',
					props: {
						assetId: '',
						assetName: '',
						assetType: '',
						label: 'Link to asset',
					},
				});
			}}
		>
			<Icon.connect className='h-5 w-5' weight='fill' />
		</ToolbarButton>
	);
};

export const AssetButtonEditor: React.FC<JsxEditorProps> = ({ mdastNode }) => {
	const [showEditModal, setShowEditModal] = useState(false);

	const updateMdastNode = useMdastNodeUpdater();

	const properties = useMemo(() => {
		const assetId = mdastNode.attributes.find(
			attr => attr.type === 'mdxJsxAttribute' && attr.name === 'assetId',
		)?.value;

		const assetName = mdastNode.attributes.find(
			attr => attr.type === 'mdxJsxAttribute' && attr.name === 'assetName',
		)?.value;

		const assetType = mdastNode.attributes.find(
			attr => attr.type === 'mdxJsxAttribute' && attr.name === 'assetType',
		)?.value;

		const label = mdastNode.attributes.find(
			attr => attr.type === 'mdxJsxAttribute' && attr.name === 'label',
		)?.value;

		return {
			assetId: typeof assetId === 'string' ? assetId : '',
			assetName: typeof assetName === 'string' ? assetName : '',
			assetType: typeof assetType === 'string' ? assetType : '',
			label: typeof label === 'string' ? label : '',
		};
	}, [mdastNode]);

	const form = useZodForm({
		schema: mdxAssetButtonSchema,
		defaultValues: {
			asset: {
				id: properties.assetId,
				name: properties.assetName,
				type: properties.assetType,
			},
			label: properties.label,
		},
	});

	const onSubmit = (values: z.infer<typeof mdxAssetButtonSchema>) => {
		const updatedAttributes = Object.entries({
			assetId: values.asset?.id ?? '',
			assetName: values.asset?.name ?? '',
			assetType: values.asset?.type ?? '',
			label: values.label,
		}).map(([name, value]) => ({
			type: 'mdxJsxAttribute' as const,
			name,
			value,
		}));

		updateMdastNode({ attributes: updatedAttributes });

		setShowEditModal(false);
	};

	const [search, setSearch] = useState('');
	const [debouncedSearch] = useDebounce(search, 300);
	const { assets } = useWorkspaceAssets({ search: debouncedSearch });
	const [comboboxOpen, setComboboxOpen] = useState(false);

	const assetOptions = assets ?? [];

	const AssetIcon = Icon[assetOptions[0]?.type as keyof typeof Icon] ?? Icon.image;

	return (
		<div
			className='flex flex-row items-center justify-between gap-2 rounded-md bg-gray-100 px-2 py-2'
			// className={styles.inlineEditor}
		>
			<div className='flex flex-row items-center gap-2'>
				<AssetIcon className='h-4 w-4' />
				<Text variant='sm/normal' className='m-0' muted>
					{properties.assetName ? properties.assetName : 'Choose an asset'}
				</Text>
			</div>
			<Popover
				open={showEditModal}
				onOpenChange={open => {
					setShowEditModal(open);
				}}
			>
				<PopoverTrigger asChild>
					<Button size='sm' startIcon='settings' variant='icon' look='ghost' />
				</PopoverTrigger>
				<PopoverContent className='w-full p-2 sm:w-96'>
					<Form form={form} onSubmit={onSubmit} className='flex flex-col gap-2 p-2'>
						<H size='5'>Cart Button Settings</H>

						<Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
							<PopoverTrigger asChild>
								<Button
									look='outline'
									role='combobox'
									aria-expanded={comboboxOpen}
									aria-label='Select an asset'
									className='flex w-full flex-row justify-between px-3 text-sm'
									fullWidth
								>
									<Text variant='sm/normal'>
										{form.watch('asset')?.name ?? 'Select an asset'}
									</Text>
									<Icon.chevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='p-0'>
								<Command>
									<CommandInput
										placeholder='Search assets...'
										value={search}
										onValueChange={setSearch}
									/>
									<CommandList>
										<CommandEmpty>No results found</CommandEmpty>
										<CommandGroup>
											{assetOptions.map(asset => {
												const AssetIcon =
													Icon[asset.type as keyof typeof Icon] ?? Icon.image;
												return (
													<CommandItem
														key={asset.id}
														value={asset.id}
														keywords={[asset.name]}
														onSelect={() => {
															form.setValue('asset', {
																id: asset.id,
																name: asset.name,
																type: asset.type,
															});
															setComboboxOpen(false);
														}}
													>
														<AssetIcon
															className={
																asset.type === 'pressKit' ?
																	'h-[14px] w-[14px]'
																:	'h-4 w-4'
															}
														/>
														{asset.name}
													</CommandItem>
												);
											})}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>

						<TextField control={form.control} label='Label' name='label' />
						<SubmitButton fullWidth>Save</SubmitButton>
					</Form>
				</PopoverContent>
			</Popover>
		</div>
	);
};
