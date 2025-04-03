'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePusherSocketId } from '@barely/lib/hooks/use-pusher';
import { useSetAtom } from 'jotai';

import { useUser } from '@barely/hooks/use-user';
import { useWorkspace } from '@barely/hooks/use-workspace';
import { useWorkspaces } from '@barely/hooks/use-workspaces';

import { Avatar } from '@barely/ui/elements/avatar';
import { Button } from '@barely/ui/elements/button';
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@barely/ui/elements/command';
import { Icon } from '@barely/ui/elements/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/elements/popover';
import { Text } from '@barely/ui/elements/typography';

import { cn } from '@barely/utils/cn';
import {
	capitalize,
	toTitleCase,
	truncate,
	underscoresToSpaces,
} from '@barely/utils/text';

import { showNewWorkspaceModalAtom } from '~/app/[handle]/_components/new-workspace-modal';

export function WorkspaceSwitcher() {
	usePusherSocketId();

	const [switcherOpen, setSwitcherOpen] = useState(false);
	const setNewWorkspaceModalOpen = useSetAtom(showNewWorkspaceModalAtom);

	const user = useUser();
	const { workspace: currentWorkspace, setWorkspace: setCurrentWorkspace } = useWorkspace(
		{
			onBeginSet: () => {
				setSwitcherOpen(false);
			},
		},
	);
	const allWorkspaces = useWorkspaces();

	const personalAccount = allWorkspaces.find(
		workspace => workspace.handle === user.handle,
	);
	const workspaces = allWorkspaces.filter(workspace => workspace.handle !== user.handle);

	const normalizedObject = {
		id: currentWorkspace.id,
		name: currentWorkspace.name ?? currentWorkspace.handle,
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
				<Button
					look='ghost'
					size='sm'
					role='combobox'
					aria-expanded={switcherOpen}
					aria-label='Select a workspace'
					className='flex h-fit w-full max-w-full flex-row gap-2 px-2 py-2'
					fullWidth
				>
					<Avatar
						className='mr-[1px] h-7 w-7'
						imageWidth={28}
						imageHeight={28}
						imageS3Key={normalizedObject.avatarImageS3Key}
						priority
					/>
					<div className='my-auto flex h-full flex-col items-start justify-center gap-0.5'>
						<Text variant='xs/bold' className='leading-tight text-accent-foreground'>
							{truncate(normalizedObject.name, 20)}
						</Text>
						<Text variant='2xs/normal' className='leading-tight text-muted-foreground'>
							{capitalize(currentWorkspace.plan)}
						</Text>
					</div>
					<Icon.chevronsUpDown className='ml-auto h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>

			<PopoverContent align='start' className='w-52 p-0'>
				<Command>
					<CommandList>
						<CommandInput placeholder='Find workspace...' />

						{personalAccount && (
							<CommandGroup heading='Personal Account'>
								<CommandItem
									onSelect={() => setCurrentWorkspace(personalAccount)}
									isSelected={currentWorkspace.handle === personalAccount.handle}
								>
									<Avatar
										priority
										className='mr-2 h-5 w-5'
										imageS3Key={personalAccount.avatarImageS3Key}
										imageWidth={20}
										imageHeight={20}
									/>
									{personalAccount.name ?? personalAccount.handle}
									<Icon.check
										className={cn(
											'ml-auto h-4 w-4',
											currentWorkspace.handle === personalAccount.handle ?
												'opacity-100'
											:	'opacity-0',
										)}
									/>
								</CommandItem>
							</CommandGroup>
						)}

						<CommandGroup heading='Workspaces'>
							{workspaces.map(workspace => (
								<CommandItem
									key={workspace.id}
									onSelect={() => setCurrentWorkspace(workspace)}
									className='cursor-pointer text-sm'
									isSelected={currentWorkspace.handle === workspace.handle}
								>
									<Avatar
										className='mr-2 h-5 w-5'
										imageS3Key={workspace.avatarImageS3Key}
										imageWidth={20}
										imageHeight={20}
										priority
									/>
									{workspace.name ?? workspace.handle}
									<Icon.check
										className={cn(
											'ml-auto h-4 w-4',
											currentWorkspace.handle === workspace.handle ?
												'opacity-100'
											:	'opacity-0',
										)}
									/>
								</CommandItem>
							))}

							<CommandItem
								onSelect={() => {
									setSwitcherOpen(false);
									setNewWorkspaceModalOpen(true);
									// setNewWorkspaceDialogOpen(true);
								}}
								className='cursor-pointer'
							>
								<Icon.plusCircle className='mr-2 h-4 w-4' />
								Create workspace
							</CommandItem>
						</CommandGroup>
					</CommandList>

					{/* <CommandSeparator /> */}

					{/* <CommandList>
							<CommandGroup>
								<DialogTrigger asChild>
									<CommandItem
										onSelect={() => {
											setSwitcherOpen(false);
											setNewWorkspaceDialogOpen(true);
										}}
										className='cursor-pointer '
									>
										<Icon.plusCircle className='mr-2 h-4 w-4' />
										Create workspace
									</CommandItem>
								</DialogTrigger>
							</CommandGroup>
						</CommandList> */}
				</Command>
			</PopoverContent>
		</Popover>
	);
}
