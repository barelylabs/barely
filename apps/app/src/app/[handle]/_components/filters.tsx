import type { IconKey } from '@barely/ui/elements/icon';
import { useCallback, useEffect, useRef } from 'react';

import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { Input } from '@barely/ui/elements/input';
import { Label } from '@barely/ui/elements/label';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/elements/popover';
import { Switch } from '@barely/ui/elements/switch';

function DisplayShortcutIcon({ shortcut, icon }: { shortcut: string; icon: IconKey }) {
	const ShortcutIcon = Icon[icon];
	return (
		<div className='flex h-4 w-4 flex-row items-center justify-center gap-2'>
			<ShortcutIcon className='h-[14px] w-[14px] group-hover:hidden' />
			<kbd className='hidden rounded-sm border border-border bg-muted px-1 py-[1px] text-xs group-hover:block'>
				{shortcut}
			</kbd>
		</div>
	);
}

export function Filters({
	search,
	setSearch,
	showArchived,
	toggleArchived,
	showDeleted,
	toggleDeleted,
	clearAllFilters,
	itemsName,
}: {
	itemsName?: string;
	search?: string;
	setSearch?: (search: string) => void;
	showArchived?: boolean;
	toggleArchived?: () => void;
	showDeleted?: boolean;
	toggleDeleted?: () => void;
	clearAllFilters: () => void;
}) {
	const searchInputRef = useRef<HTMLInputElement>(null);

	const onKeydown = useCallback(
		(e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const existingModalBackdrop = document.getElementById('modal-backdrop');
			const existingPopoverBackdrop = document.querySelector('.z-50[role="dialog"]');
			console.log('existingPopoverBackdrop', existingPopoverBackdrop);

			const hotkeysEnabled =
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop &&
				!existingPopoverBackdrop;

			const noMetaOrCtrl = !e.metaKey && !e.ctrlKey;

			if (e.key === 'a' && hotkeysEnabled && noMetaOrCtrl) {
				toggleArchived?.();
			}
			if (e.key === 'd' && hotkeysEnabled && noMetaOrCtrl) {
				toggleDeleted?.();
			}
			if (e.key === 'Escape' && hotkeysEnabled && noMetaOrCtrl) {
				clearAllFilters();
				if (searchInputRef.current) {
					searchInputRef.current.value = '';
				}
			}
		},
		[clearAllFilters, toggleArchived, toggleDeleted],
	);

	useEffect(() => {
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	}, [onKeydown]);

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
					{toggleArchived !== undefined && (
						<div className='group flex flex-row items-center justify-between gap-4'>
							<Label htmlFor='showArchivedSwitch'>
								<div className='flex flex-row items-center gap-2'>
									<DisplayShortcutIcon shortcut='A' icon='archive' />
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
									<DisplayShortcutIcon shortcut='D' icon='trash' />
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
					placeholder='Search...'
					showClearButton={true}
					onClear={() => setSearch?.('')}
				/>
			</div>
		</div>
	);
}
