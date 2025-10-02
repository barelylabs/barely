'use client';

import type { JsxComponentDescriptor, JsxEditorProps } from '@mdxeditor/editor';
import type { z } from 'zod/v4';
import { useMemo, useState } from 'react';
import { useDebounce, useWorkspaceAssets, useZodForm } from '@barely/hooks';
import { mdxAssetButtonSchema, mdxLinkButtonSchema } from '@barely/lib/mdx/mdx.schema';
import {
	insertJsx$,
	Button as ToolbarButton,
	useMdastNodeUpdater,
	usePublisher,
} from '@mdxeditor/editor';

import { Form, SubmitButton } from '../../../forms/form';
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
import { H } from '../../typography';

export const buttonComponentDescriptors: JsxComponentDescriptor[] = [
	{
		name: 'LinkButton',
		kind: 'flow',
		props: [
			{
				name: 'href',
				type: 'string',
			},
			{
				name: 'label',
				type: 'string',
			},
		],
		Editor: props => {
			const href = props.mdastNode.attributes.find(
				a => a.type === 'mdxJsxAttribute' && a.name === 'href',
			)?.value;

			const label = props.mdastNode.attributes.find(
				a => a.type === 'mdxJsxAttribute' && a.name === 'label',
			)?.value;

			const validHref = typeof href === 'string' && href.trim() !== '' ? href : '#';

			return (
				<div className='mx-auto h-fit w-full py-4'>
					<div className='flex w-full flex-col'>
						<Button href={validHref} target='_blank' fullWidth>
							{typeof label === 'string' ? label : ''}
						</Button>
						<LinkButtonEditor {...props} />
					</div>
				</div>
			);
		},
	},
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

// LINK BUTTON
export const InsertLinkButtonButton = () => {
	const insertJsx = usePublisher(insertJsx$);
	return (
		<ToolbarButton
			onClick={() => {
				insertJsx({
					name: 'LinkButton',
					kind: 'flow',
					props: {
						href: '',
						label: 'Link to asset',
					},
				});
			}}
		>
			<Icon.link className='h-5 w-5' />
		</ToolbarButton>
	);
};

export const LinkButtonEditor: React.FC<JsxEditorProps> = ({ mdastNode }) => {
	const [showEditModal, setShowEditModal] = useState(false);

	const updateMdastNode = useMdastNodeUpdater();

	const properties = useMemo(() => {
		const href = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'href',
		)?.value;

		const label = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'label',
		)?.value;

		return {
			href: typeof href === 'string' ? href : '',
			label: typeof label === 'string' ? label : '',
		};
	}, [mdastNode]);

	const form = useZodForm({
		schema: mdxLinkButtonSchema,
		defaultValues: {
			href: properties.href,
			label: properties.label,
		},
	});

	const onSubmit = (values: z.infer<typeof mdxLinkButtonSchema>) => {
		const updatedAttributes = Object.entries({
			href: values.href,
			label: values.label,
		}).map(([name, value]) => ({
			type: 'mdxJsxAttribute' as const,
			name,
			value,
		}));

		updateMdastNode({ attributes: updatedAttributes });
		setShowEditModal(false);
	};

	return (
		<div className='flex flex-row items-center justify-between gap-2 rounded-md bg-gray-100 px-2 py-2'>
			<div className='flex flex-row items-center gap-2'>
				<Icon.link className='h-4 w-4' />
				<span className='text-sm text-muted-foreground'>
					{properties.href || 'No link set'}
				</span>
			</div>
			<Popover open={showEditModal} onOpenChange={open => setShowEditModal(open)}>
				<PopoverTrigger asChild>
					<Button size='sm' startIcon='settings' variant='icon' look='ghost' />
				</PopoverTrigger>
				<PopoverContent className='w-full p-2 sm:w-96'>
					<Form form={form} onSubmit={onSubmit} className='flex flex-col gap-2 p-2'>
						<H size='5'>Link Button Settings</H>
						<TextField control={form.control} label='Link' name='href' />
						<TextField control={form.control} label='Label' name='label' />
						<SubmitButton fullWidth>Save</SubmitButton>
					</Form>
				</PopoverContent>
			</Popover>
		</div>
	);
};

// ASSET BUTTON
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
			assetId: values.asset.id,
			assetName: values.asset.name,
			assetType: values.asset.type,
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

	const assetOptions = assets;

	// Helper function to safely get icon by asset type
	const getAssetIcon = (assetType?: string) => {
		if (!assetType) return Icon.file;

		// Type guard to check if assetType is a valid Icon key
		const isValidIconKey = (key: string): key is keyof typeof Icon => {
			return key in Icon;
		};

		return isValidIconKey(assetType) ? Icon[assetType] : Icon.file;
	};

	const AssetIcon = getAssetIcon(assetOptions[0]?.type);

	return (
		<div className='flex flex-row items-center justify-between gap-2 rounded-md bg-gray-100 px-2 py-2'>
			<div className='flex flex-row items-center gap-2'>
				<AssetIcon className='h-4 w-4' />
				<span className='text-sm text-muted-foreground'>
					{properties.assetName ? properties.assetName : 'Choose an asset'}
				</span>
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
									<span className='text-sm'>{form.watch('asset').name}</span>
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
												const AssetIcon = getAssetIcon(asset.type);
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
