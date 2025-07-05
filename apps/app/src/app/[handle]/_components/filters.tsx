import type { IconKey } from '@barely/ui/icon';
import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@barely/utils';
import { parseAsBoolean, useQueryState } from 'nuqs';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Input } from '@barely/ui/input';
import { Label } from '@barely/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import { Switch } from '@barely/ui/switch';

function DisplayShortcutIcon({
	shortcut,
	icon,
}: {
	shortcut: string | string[];
	icon: IconKey;
}) {
	const ShortcutIcon = Icon[icon];
	return (
		<div className='flex h-4 w-fit flex-row items-center justify-center gap-1'>
			<ShortcutIcon className='h-[14px] w-[14px] group-hover:hidden' />
			{Array.isArray(shortcut) ?
				shortcut.map((s, i) => (
					<div className='hidden flex-row items-center gap-1 group-hover:flex' key={i}>
						<kbd
							className={cn(
								'inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-sm border border-border bg-muted px-1 py-[1px]',
								s === 'Shift' && 'px-[2px]',
							)}
							key={s}
						>
							{s === 'Shift' ?
								<Icon.shift className='h-3 w-2.5 p-0' />
							:	<span className='text-2xs leading-none'>{s}</span>}
						</kbd>
						{i < shortcut.length - 1 && <span className='text-2xs'>+</span>}
					</div>
				))
			:	<kbd className='hidden h-3.5 min-w-[14px] items-center justify-center rounded-sm border border-border bg-muted px-1 py-[1px] text-xs group-hover:block'>
					{shortcut}
				</kbd>
			}
		</div>
	);
}

export function Filters({
	search,
	setSearch,
	searchPlaceholder,
	showArchived,
	toggleArchived,
	showDeleted,
	toggleDeleted,
	showCanceled,
	toggleCanceled,
	showFulfilled,
	toggleFulfilled,
	showPreorders,
	togglePreorders,
	clearAllFilters,
	itemsName,
}: {
	itemsName?: string;
	search?: string;
	setSearch?: (search: string) => void;
	searchPlaceholder?: string;
	showArchived?: boolean;
	toggleArchived?: () => void;
	showCanceled?: boolean;
	toggleCanceled?: () => void;
	showPreorders?: boolean;
	togglePreorders?: () => void;
	showFulfilled?: boolean;
	toggleFulfilled?: () => void;
	showDeleted?: boolean;
	toggleDeleted?: () => void;
	clearAllFilters: () => Promise<URLSearchParams>;
}) {
	const searchInputRef = useRef<HTMLInputElement>(null);

	const onKeydown = useCallback(
		(e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const existingModalBackdrop = document.getElementById('modal-backdrop');
			const existingPopoverBackdrop = document.querySelector('.z-50[role="dialog"]');
			// console.log('existingPopoverBackdrop', existingPopoverBackdrop);

			const hotkeysEnabled =
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop &&
				!existingPopoverBackdrop;

			const metaOrCtrl = e.metaKey || e.ctrlKey;

			if (e.shiftKey && e.key === 'A' && hotkeysEnabled && !metaOrCtrl) {
				console.log('toggleArchived');
				toggleArchived?.();
			}

			if (e.shiftKey && e.key === 'D' && hotkeysEnabled && !metaOrCtrl) {
				console.log('toggleDeleted');
				toggleDeleted?.();
			}
			if (e.shiftKey && e.key === 'F' && hotkeysEnabled && !metaOrCtrl) {
				console.log('toggleFulfilled');
				toggleFulfilled?.();
			}
			if (e.shiftKey && e.key === 'P' && hotkeysEnabled && !metaOrCtrl) {
				console.log('togglePreorders');
				togglePreorders?.();
			}
			if (e.shiftKey && e.key === 'X' && hotkeysEnabled && !metaOrCtrl) {
				console.log('toggleCanceled');
				toggleCanceled?.();
			}
			if (e.key === 'Escape' && hotkeysEnabled && !metaOrCtrl) {
				clearAllFilters();
				if (searchInputRef.current) {
					searchInputRef.current.value = '';
				}
			}
		},
		[
			clearAllFilters,
			toggleArchived,
			toggleDeleted,
			toggleFulfilled,
			togglePreorders,
			toggleCanceled,
		],
	);

	useEffect(() => {
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	}, [onKeydown]);

	// const [showArchived, setShowArchived] = useQueryState('showArchived', parseAsBoolean.withDefault(false));

	return (
		<div className='flex flex-row items-center justify-between gap-4'>
			<Popover>
				<PopoverTrigger asChild>
					<Button look='outline' size='md'>
						<div className='flex flex-row items-center gap-2'>
							<Icon.displaySettings className='h-4 w-4' />
							<span className='text-sm'>Display</span>
						</div>
					</Button>
				</PopoverTrigger>

				<PopoverContent>
					{toggleFulfilled !== undefined && (
						<div className='group flex flex-row items-center justify-between gap-4'>
							<Label htmlFor='showFulfilledSwitch'>
								<div className='flex flex-row items-center gap-2'>
									<DisplayShortcutIcon shortcut={['Shift', 'F']} icon='check' />
									Include fulfilled {itemsName ?? 'items'}
								</div>
							</Label>
							<Switch
								id='showFulfilledSwitch'
								checked={!!showFulfilled}
								onClick={() => toggleFulfilled()}
								size='sm'
							/>
						</div>
					)}

					{togglePreorders !== undefined && (
						<div className='group flex flex-row items-center justify-between gap-4'>
							<Label htmlFor='showPreordersSwitch'>
								<div className='flex flex-row items-center gap-2'>
									<DisplayShortcutIcon shortcut={['Shift', 'P']} icon='check' />
									Include preorders
								</div>
							</Label>
							<Switch
								id='showPreordersSwitch'
								checked={!!showPreorders}
								onClick={() => togglePreorders()}
								size='sm'
							/>
						</div>
					)}

					{toggleArchived !== undefined && (
						<div className='group flex flex-row items-center justify-between gap-4'>
							<Label htmlFor='showArchivedSwitch'>
								<div className='flex flex-row items-center gap-2'>
									<DisplayShortcutIcon shortcut={['Shift', 'A']} icon='archive' />
									Include archived {itemsName ?? 'items'}
								</div>
							</Label>
							<Switch
								id='showArchivedSwitch'
								checked={!!showArchived}
								onClick={() => toggleArchived()}
								size='sm'
							/>
						</div>
					)}

					{toggleDeleted !== undefined && (
						<div className='group flex flex-row items-center justify-between gap-4'>
							<Label htmlFor='showDeletedSwitch'>
								<div className='flex flex-row items-center gap-2'>
									<DisplayShortcutIcon shortcut={['Shift', 'D']} icon='trash' />
									Include deleted {itemsName ?? 'items'}
								</div>
							</Label>
							<Switch
								id='showDeletedSwitch'
								checked={!!showDeleted}
								onClick={() => toggleDeleted()}
								size='sm'
							/>
						</div>
					)}

					{toggleCanceled !== undefined && (
						<div className='group flex flex-row items-center justify-between gap-4'>
							<Label htmlFor='showCanceledSwitch'>
								<div className='flex flex-row items-center gap-2'>
									<DisplayShortcutIcon shortcut={['Shift', 'X']} icon='x' />
									Include canceled {itemsName ?? 'items'}
								</div>
							</Label>
							<Switch
								id='showCanceledSwitch'
								checked={!!showCanceled}
								onClick={() => toggleCanceled()}
								size='sm'
							/>
						</div>
					)}
				</PopoverContent>
			</Popover>

			<div className='w-full max-w-xs'>
				<Input
					id='searchInput'
					startIcon='search'
					defaultValue={search ?? ''}
					ref={searchInputRef}
					onChangeDebounced={e => setSearch?.(e.target.value)}
					debounce={500}
					placeholder={searchPlaceholder ?? 'Search...'}
					showClearButton={true}
					onClear={() => setSearch?.('')}
				/>
			</div>
		</div>
	);
}
