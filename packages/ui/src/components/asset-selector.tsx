'use client';

import type { Bio, CartFunnel, FmPage, Link } from '@barely/validators';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { cn, getFmPageUrlFromFmPage } from '@barely/utils';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Controller } from 'react-hook-form';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { FieldProps } from '../forms/field-wrapper';
import { Button } from '../elements/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../elements/command';
import { Popover, PopoverContent, PopoverTrigger } from '../elements/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../elements/select';
import { FieldWrapper } from '../forms/field-wrapper';
import { FieldControl, FormFieldContext, FormItem } from '../forms/form';
import { TextField } from '../forms/text-field';

export type AssetType = 'url' | 'bio' | 'fm' | 'cart' | 'link';

export interface AssetSelectorValue {
	type: AssetType;
	url?: string;
	bioId?: string;
	fmId?: string;
	cartFunnelId?: string;
	linkId?: string;
}

export interface AssetSelectorProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends FieldProps<TFieldValues, TName> {
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	disableController?: boolean;
	hint?: string;
	allowedTypes?: AssetType[];
}

export const AssetSelector = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	hint,
	allowedTypes = ['url', 'bio', 'cart', 'link'],
	...props
}: AssetSelectorProps<TFieldValues, TName>) => {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const [searchQuery, setSearchQuery] = useState('');

	// Fetch bios
	const biosQuery = useSuspenseInfiniteQuery(
		trpc.bio.byWorkspace.infiniteQueryOptions(
			{ handle, search: searchQuery, limit: 20 },
			{ getNextPageParam: lastPage => lastPage.nextCursor },
		),
	);
	const bios = biosQuery.data.pages.flatMap(p => p.bios);

	// Fetch cart funnels
	const cartFunnelsQuery = useSuspenseInfiniteQuery(
		trpc.cartFunnel.byWorkspace.infiniteQueryOptions(
			{ handle, search: searchQuery, limit: 20 },
			{ getNextPageParam: lastPage => lastPage.nextCursor },
		),
	);
	const cartFunnels = cartFunnelsQuery.data.pages.flatMap(p => p.cartFunnels);

	// Fetch links
	const linksQuery = useSuspenseInfiniteQuery(
		trpc.link.byWorkspace.infiniteQueryOptions(
			{ handle, search: searchQuery, limit: 20 },
			{ getNextPageParam: lastPage => lastPage.nextCursor },
		),
	);
	const links = linksQuery.data.pages.flatMap(p => p.links);

	// Fetch FM pages
	const fmsQuery = useSuspenseInfiniteQuery(
		trpc.fm.byWorkspace.infiniteQueryOptions(
			{ handle, search: searchQuery, limit: 20 },
			{ getNextPageParam: lastPage => lastPage.nextCursor },
		),
	);
	const fmPages = fmsQuery.data.pages.flatMap(p => p.fmPages);

	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				disabled={props.disableController}
				render={({ field }) => {
					const currentValue = field.value as AssetSelectorValue | undefined;
					const currentType = currentValue?.type ?? 'url';

					const handleTypeChange = (newType: AssetType) => {
						// Clear all fields when switching types
						field.onChange({
							type: newType,
							url: undefined,
							bioId: undefined,
							fmId: undefined,
							cartFunnelId: undefined,
							linkId: undefined,
						});
					};

					const handleAssetSelect = (assetId: string, type: AssetType) => {
						const newValue: AssetSelectorValue = {
							type,
							url: undefined,
							bioId: undefined,
							fmId: undefined,
							cartFunnelId: undefined,
							linkId: undefined,
						};

						switch (type) {
							case 'bio':
								newValue.bioId = assetId;
								break;
							case 'cart':
								newValue.cartFunnelId = assetId;
								break;
							case 'link':
								newValue.linkId = assetId;
								break;
							case 'fm':
								newValue.fmId = assetId;
								break;
							case 'url':
								newValue.url = assetId;
								break;
						}

						field.onChange(newValue);
					};

					const handleUrlChange = (url: string) => {
						field.onChange({
							...currentValue,
							type: 'url',
							url,
						});
					};

					return (
						<FormItem>
							<FieldWrapper {...props} hint={hint}>
								<div className='space-y-2'>
									{/* Asset Type Selector */}
									<Select value={currentType} onValueChange={handleTypeChange}>
										<FieldControl>
											<SelectTrigger className={props.className}>
												<SelectValue placeholder='Select asset type' />
											</SelectTrigger>
										</FieldControl>
										<SelectContent>
											{allowedTypes.includes('url') && (
												<SelectItem value='url'>Direct URL</SelectItem>
											)}
											{allowedTypes.includes('bio') && (
												<SelectItem value='bio'>Bio Page</SelectItem>
											)}
											{allowedTypes.includes('fm') && (
												<SelectItem value='fm'>FM Page</SelectItem>
											)}
											{allowedTypes.includes('cart') && (
												<SelectItem value='cart'>Cart Funnel</SelectItem>
											)}
											{allowedTypes.includes('link') && (
												<SelectItem value='link'>Short Link</SelectItem>
											)}
										</SelectContent>
									</Select>

									{/* Dynamic Asset Input */}
									{currentType === 'url' && (
										<TextField
											control={props.control}
											name={`${props.name}.url` as TName}
											type='url'
											placeholder='Enter URL (e.g., https://example.com)'
											onChange={e => handleUrlChange(e.target.value)}
										/>
									)}

									{currentType === 'bio' && (
										<AssetCombobox
											items={bios}
											selectedId={currentValue?.bioId}
											onSelect={id => handleAssetSelect(id, 'bio')}
											placeholder='Select a bio page'
											searchPlaceholder='Search bios...'
											emptyText='No bio pages found.'
											displayField='handle'
											secondaryDisplayField='key'
											loading={biosQuery.isLoading}
											onSearch={setSearchQuery}
										/>
									)}

									{currentType === 'cart' && (
										<AssetCombobox
											items={cartFunnels}
											selectedId={currentValue?.cartFunnelId}
											onSelect={id => handleAssetSelect(id, 'cart')}
											placeholder='Select a cart funnel'
											searchPlaceholder='Search cart funnels...'
											emptyText='No cart funnels found.'
											displayField='name'
											loading={cartFunnelsQuery.isLoading}
											onSearch={setSearchQuery}
										/>
									)}

									{currentType === 'link' && (
										<AssetCombobox
											items={links}
											selectedId={currentValue?.linkId}
											onSelect={id => handleAssetSelect(id, 'link')}
											placeholder='Select a short link'
											searchPlaceholder='Search links...'
											emptyText='No short links found.'
											displayField='key'
											secondaryDisplayField='url'
											loading={linksQuery.isLoading}
											onSearch={setSearchQuery}
										/>
									)}

									{currentType === 'fm' && (
										<div className='rounded-md border border-dashed p-3 text-sm text-muted-foreground'>
											FM pages are not yet available
										</div>
									)}
								</div>

								{/* Preview of selected asset */}
								{currentValue && (
									<AssetPreview
										value={currentValue}
										items={{ bios, cartFunnels, links, fmPages }}
									/>
								)}
							</FieldWrapper>
						</FormItem>
					);
				}}
			/>
		</FormFieldContext.Provider>
	);
};

// Define a base interface for items that can be displayed in the combobox
interface AssetItem {
	id: string;
	name?: string | null;
	handle?: string | null;
	key?: string | null;
	url?: string | null;
}

// Reusable combobox for searchable asset selection
interface AssetComboboxProps<T extends AssetItem> {
	items: T[];
	selectedId?: string;
	onSelect: (id: string) => void;
	placeholder: string;
	searchPlaceholder: string;
	emptyText: string;
	displayField: keyof T;
	secondaryDisplayField?: keyof T;
	loading?: boolean;
	onSearch: (query: string) => void;
}

function AssetCombobox<T extends AssetItem>({
	items,
	selectedId,
	onSelect,
	placeholder,
	searchPlaceholder,
	emptyText,
	displayField,
	secondaryDisplayField,
	loading,
	onSearch,
}: AssetComboboxProps<T>) {
	const [open, setOpen] = useState(false);
	const selectedItem = items.find(item => item.id === selectedId);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					look='outline'
					role='combobox'
					aria-expanded={open}
					className='w-full justify-between'
				>
					{selectedItem ?
						<span className='truncate'>
							{selectedItem[displayField] as string}
							{secondaryDisplayField && selectedItem[secondaryDisplayField] && (
								<span className='ml-2 text-muted-foreground'>
									({selectedItem[secondaryDisplayField] as string})
								</span>
							)}
						</span>
					:	<span className='text-muted-foreground'>{placeholder}</span>}
					{loading ?
						<Loader2 className='ml-2 h-4 w-4 shrink-0 animate-spin opacity-50' />
					:	<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-full p-0' align='start'>
				<Command>
					<CommandInput
						placeholder={searchPlaceholder}
						onValueChange={onSearch}
						className='h-9'
					/>
					<CommandList>
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{items.map(item => (
								<CommandItem
									key={item.id}
									value={item.id}
									onSelect={() => {
										onSelect(item.id);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											selectedId === item.id ? 'opacity-100' : 'opacity-0',
										)}
									/>
									<span className='truncate'>
										{item[displayField] as string}
										{secondaryDisplayField && item[secondaryDisplayField] && (
											<span className='ml-2 text-xs text-muted-foreground'>
												{item[secondaryDisplayField] as string}
											</span>
										)}
									</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

// Asset preview component
interface AssetPreviewProps {
	value: AssetSelectorValue;
	items: {
		bios: Bio[];
		cartFunnels: CartFunnel[];
		links: Link[];
		fmPages: FmPage[];
	};
}

function AssetPreview({ value, items }: AssetPreviewProps) {
	let previewText = '';
	let previewUrl = '';

	switch (value.type) {
		case 'url':
			if (value.url) {
				previewText = 'Direct URL';
				previewUrl = value.url;
			}
			break;
		case 'bio':
			if (value.bioId) {
				const bio = items.bios.find(b => b.id === value.bioId);
				if (bio) {
					previewText = `Bio: ${bio.handle}/${bio.key}`;
					previewUrl = `/bio/${bio.handle}/${bio.key}`;
				}
			}
			break;
		case 'cart':
			if (value.cartFunnelId) {
				const cart = items.cartFunnels.find(c => c.id === value.cartFunnelId);
				if (cart) {
					previewText = `Cart: ${cart.name}`;
					previewUrl = `/cart/${cart.handle}/${cart.key}`;
				}
			}
			break;
		case 'link':
			if (value.linkId) {
				const link = items.links.find(l => l.id === value.linkId);
				if (link) {
					previewText = `Link: ${link.key}`;
					previewUrl = link.url;
				}
			}
			break;
		case 'fm':
			if (value.fmId) {
				const fm = items.fmPages.find(f => f.id === value.fmId);
				if (fm) {
					previewText = `FM: ${fm.title}`;
					previewUrl = getFmPageUrlFromFmPage(fm);
				}
			}
			break;
	}

	if (!previewText) return null;

	return (
		<div className='mt-2 rounded-md bg-muted/50 p-2 text-xs'>
			<div className='font-medium'>{previewText}</div>
			{previewUrl && <div className='text-muted-foreground'>{previewUrl}</div>}
		</div>
	);
}
