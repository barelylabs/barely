"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@barely/hooks/use-user";
import { useWorkspace } from "@barely/hooks/use-workspace";
import { useWorkspaces } from "@barely/hooks/use-workspaces";
import { Avatar } from "@barely/ui/elements/avatar";
import { Badge } from "@barely/ui/elements/badge";
import { Button } from "@barely/ui/elements/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@barely/ui/elements/command";
import { Icon } from "@barely/ui/elements/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@barely/ui/elements/popover";
import { Text } from "@barely/ui/elements/typography";
import { cn } from "@barely/utils/cn";
import {
  capitalize,
  toTitleCase,
  underscoresToSpaces,
} from "@barely/utils/text";
import { useSetAtom } from "jotai";

import { showNewWorkspaceModalAtom } from "~/app/[handle]/_components/new-workspace-modal";

export function WorkspaceSwitcher() {
  const router = useRouter();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const setNewWorkspaceModalOpen = useSetAtom(showNewWorkspaceModalAtom);

  const user = useUser();
  const currentWorkspace = useWorkspace();
  const allWorkspaces = useWorkspaces();

  const personalAccount = allWorkspaces.find(
    (workspace) => workspace.handle === user.handle,
  );
  const workspaces = allWorkspaces.filter(
    (workspace) => workspace.handle !== user.handle,
  );

  const normalizedObject = {
    id: currentWorkspace.id,
    name: currentWorkspace.name ?? currentWorkspace.handle,
    imageUrl: currentWorkspace.imageUrl ?? "",
    type: toTitleCase(underscoresToSpaces(currentWorkspace.type)),
  };

  const currentPath = usePathname();

  return (
    <Popover open={switcherOpen} onOpenChange={setSwitcherOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={switcherOpen}
          aria-label="Select a workspace"
          className="flex h-fit w-full flex-row gap-2 px-2 py-2"
          fullWidth
        >
          <Avatar className="h-7 w-7" imageUrl={normalizedObject.imageUrl} />
          <Text variant="xs/medium">{normalizedObject.name}</Text>

          <Badge variant="info" size="2xs" className="h-full">
            {capitalize(currentWorkspace.plan)}
          </Badge>

          <Icon.chevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-52 p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Find workspace..." />

            {personalAccount && (
              <CommandGroup heading="Personal Account">
                <CommandItem
                  onSelect={() => {
                    setSwitcherOpen(false);
                    if (currentWorkspace.handle === personalAccount.handle)
                      return;
                    if (currentPath) {
                      return router.push(
                        currentPath.replace(
                          currentWorkspace.handle,
                          personalAccount.handle,
                        ),
                      );
                    }
                    return router.push(`/${personalAccount.handle}`);
                  }}
                  isSelected={
                    currentWorkspace.handle === personalAccount.handle
                  }
                >
                  <Avatar
                    className="mr-2 h-5 w-5"
                    imageUrl={personalAccount.imageUrl ?? ""}
                  />
                  {personalAccount.name ?? personalAccount.handle}
                  <Icon.check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentWorkspace.handle === personalAccount.handle
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup heading="Workspaces">
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  onSelect={() => {
                    setSwitcherOpen(false);
                    if (currentWorkspace.handle === workspace.handle) return;
                    if (currentPath) {
                      return router.push(
                        currentPath.replace(
                          currentWorkspace.handle,
                          workspace.handle,
                        ),
                      );
                    }
                    return router.push(`/${workspace.handle}`);
                  }}
                  className="cursor-pointer text-sm"
                  isSelected={currentWorkspace.handle === workspace.handle}
                >
                  <Avatar
                    className="mr-2 h-5 w-5"
                    imageUrl={workspace.imageUrl ?? ""}
                  />
                  {workspace.name ?? workspace.handle}
                  <Icon.check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentWorkspace.handle === workspace.handle
                        ? "opacity-100"
                        : "opacity-0",
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
                className="cursor-pointer "
              >
                <Icon.plusCircle className="mr-2 h-4 w-4" />
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
