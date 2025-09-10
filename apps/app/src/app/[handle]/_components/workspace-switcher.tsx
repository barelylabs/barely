'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePusherSocketId, useUser, useWorkspace, useWorkspaces } from '@barely/hooks';
import {
	cn,
	getPlanNameFromId,
	toTitleCase,
	truncate,
	underscoresToSpaces,
} from '@barely/utils';

import { Avatar } from '@barely/ui/avatar';
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@barely/ui/command';
import { Icon } from '@barely/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import { Text } from '@barely/ui/typography';

import { useWorkspaceModalState } from './workspace-context';

interface WorkspaceSwitcherProps {
	collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
	usePusherSocketId();

	const [switcherOpen, setSwitcherOpen] = useState(false);
	const { setShowNewWorkspaceModal } = useWorkspaceModalState();

	const user = useUser();
	const { workspace: currentWorkspace, setWorkspace: setCurrentWorkspace } = useWorkspace(
		{
			onBeginSet: () => {
				setSwitcherOpen(false);
			},
		},
	);
	const allWorkspaces = useWorkspaces();

	// const personalAccount = allWorkspaces.find(
	// 	workspace => workspace.handle === user.handle,
	// );
	const workspaces = allWorkspaces.filter(workspace => workspace.handle !== user.handle);

	const normalizedObject = {
		id: currentWorkspace.id,
		name: currentWorkspace.name,
		avatarImageS3Key: currentWorkspace.avatarImageS3Key,
		type: toTitleCase(underscoresToSpaces(currentWorkspace.type)),
	};

	const onKeydown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === '.' && (e.metaKey || e.ctrlKey)) {
				if (switcherOpen) {
					setSwitcherOpen(false);
				} else {
					setSwitcherOpen(true);
				}
			}
		},
		[switcherOpen, setSwitcherOpen],
	);

	useEffect(() => {
		document.addEventListener('keydown', onKeydown);
		return () => {
			document.removeEventListener('keydown', onKeydown);
		};
	}, [onKeydown]);

	// const { setWorkspace: setCurrentWorkspace } = useOptimisticWorkspace({
	// 	onBeginSet: () => {
	// 		setSwitcherOpen(false);
	// 	},
	// });

	return (
		<Popover open={switcherOpen} onOpenChange={setSwitcherOpen}>
			<PopoverTrigger asChild>
				<button
					role='combobox'
					aria-expanded={switcherOpen}
					aria-label='Select a workspace'
					className={cn(
						'flex items-center justify-center rounded-lg transition-all duration-150',
						'outline-none focus-visible:ring-2 focus-visible:ring-black/20',
						'active:bg-subtle-foreground/50 hover:bg-subtle-foreground/50',
						switcherOpen && 'bg-subtle-foreground/50',
						collapsed ? 'h-11 w-11 p-1.5' : 'h-12 w-full gap-2 px-3 py-2',
					)}
				>
					<Avatar
						className='h-8 w-8 flex-shrink-0'
						imageWidth={32}
						imageHeight={32}
						imageS3Key={normalizedObject.avatarImageS3Key}
						priority
					/>
					{!collapsed && (
						<>
							<div className='flex flex-1 flex-col items-start justify-center'>
								<Text variant='sm/semibold' className='truncate text-neutral-900'>
									{truncate(normalizedObject.name, 16)}
								</Text>
								<Text variant='xs/normal' className='text-neutral-500'>
									{getPlanNameFromId(currentWorkspace.plan)}
								</Text>
							</div>
							<Icon.chevronsUpDown className='h-4 w-4 shrink-0 text-neutral-400' />
						</>
					)}
				</button>
			</PopoverTrigger>

			<PopoverContent side='right' align='start' className='ml-2 w-64 p-0'>
				{/* Current Workspace Header */}
				<div className='border-b p-4'>
					<div className='flex items-center gap-3'>
						<Avatar
							className='h-10 w-10'
							imageWidth={40}
							imageHeight={40}
							imageS3Key={currentWorkspace.avatarImageS3Key}
							priority
						/>
						<div className='flex-1'>
							<Text variant='sm/semibold' className='text-neutral-900'>
								{currentWorkspace.name}
							</Text>
							<Text variant='xs/normal' className='text-neutral-500'>
								{getPlanNameFromId(currentWorkspace.plan)}
							</Text>
						</div>
					</div>
				</div>

				{/* Settings and Invite Links */}
				<div className='border-b p-2'>
					<Link
						href={`/${currentWorkspace.handle}/settings`}
						onClick={() => setSwitcherOpen(false)}
						className='flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100'
					>
						<Icon.settings className='h-4 w-4 text-neutral-500' />
						Settings
					</Link>
					<Link
						href={`/${currentWorkspace.handle}/settings/team`}
						onClick={() => setSwitcherOpen(false)}
						className='flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100'
					>
						<Icon.userPlus className='h-4 w-4 text-neutral-500' />
						Invite members
					</Link>
				</div>

				{/* Workspace List */}
				<Command>
					<CommandList>
						<CommandInput placeholder='Find workspace...' className='h-9' />

						<CommandGroup heading='Workspaces'>
							{workspaces.map(workspace => (
								<CommandItem
									key={workspace.id}
									onSelect={() => setCurrentWorkspace(workspace)}
									className='cursor-pointer gap-3 text-sm'
									isSelected={currentWorkspace.handle === workspace.handle}
								>
									<Avatar
										className='h-6 w-6'
										imageS3Key={workspace.avatarImageS3Key}
										imageWidth={24}
										imageHeight={24}
										priority
									/>
									<span className='flex-1'>{workspace.name}</span>
									{currentWorkspace.handle === workspace.handle && (
										<Icon.check className='h-4 w-4 text-neutral-500' />
									)}
								</CommandItem>
							))}
						</CommandGroup>

						<CommandSeparator />

						<CommandGroup>
							<CommandItem
								onSelect={async () => {
									setSwitcherOpen(false);
									await setShowNewWorkspaceModal(true);
								}}
								className='cursor-pointer gap-3'
							>
								<div className='flex h-6 w-6 items-center justify-center'>
									<Icon.plus className='h-4 w-4 text-neutral-500' />
								</div>
								<span>Create new workspace</span>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
