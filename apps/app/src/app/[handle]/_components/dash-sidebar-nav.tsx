"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navHistoryAtom } from "@barely/atoms/navigation-history.atom";
import { usePathnameMatchesCurrentPath } from "@barely/hooks/use-pathname-matches-current-path";
import { useWorkspaces } from "@barely/hooks/use-workspaces";
import { useWorkspace } from "@barely/lib/hooks/use-workspace";
import { Icon } from "@barely/ui/elements/icon";
import { ScrollArea } from "@barely/ui/elements/scroll-area";
import { Text } from "@barely/ui/elements/typography";
import { cn } from "@barely/utils/cn";
import { useAtomValue } from "jotai";

import type { Workspace } from "@barely/server/workspace.schema";

import type { SidebarNavItem } from "~/types/nav";
import { WorkspaceSwitcher } from "~/app/[handle]/_components/workspace-switcher";

export interface SidebarNavProps {
  workspace: Workspace;
}

export function SidebarNav(props: SidebarNavProps) {
  const handle = props.workspace.handle;
  const pathname = usePathname();
  const workspace = useWorkspace();
  const workspaces = useWorkspaces();

  const allHandles = workspaces.map((workspace) => workspace.handle);

  const isSettings = pathname?.includes("/settings");

  const navHistory = useAtomValue(navHistoryAtom);

  const topMainLinks: SidebarNavItem[] = [
    {
      title: "links",
      href: `/${handle}/links`,
      icon: "link",
    },
    {
      title: "media",
      href: `/${handle}/media`,
      icon: "media",
    },
    {
      title: "tracks",
      href: `/${handle}/tracks`,
      icon: "music",
      workspaceFilters: ["feature__tracks"],
    },
    {
      title: "mixtapes",
      href: `/${handle}/mixtapes`,
      icon: "mixtape",
      workspaceFilters: ["feature__mixtapes"],
    },
    {
      title: "press",
      href: `/${handle}/press`,
      icon: "press",
      workspaceFilters: ["feature__pressKits"],
    },
    {
      title: "settings",
      href: `/${handle}/settings`,
      icon: "settings",
    },
  ];

  const topSettingsLinks: SidebarNavItem[] = [
    {
      title: "profile",
      href: `/${handle}/settings`,
      icon: "profile",
    },
    {
      title: "domains",
      href: `/${handle}/settings/domains`,
      icon: "domain",
    },
    {
      title: "remarketing",
      href: `/${handle}/settings/remarketing`,
      icon: "remarketing",
    },
    {
      title: "billing",
      href: `/${handle}/settings/billing`,
      icon: "billing",
    },
  ];

  const topLinks = isSettings ? topSettingsLinks : topMainLinks;

  const settingsBackLink = useMemo(() => {
    let bl = navHistory?.settingsBackPath ?? `/${handle}/links`; // eg. /{handle}/settings/profile
    const blHandle = bl.split("/")[1]; // eg. {handle}
    if (blHandle && allHandles.includes(blHandle) && blHandle !== handle)
      bl = bl.replace(`/${blHandle}`, `/${handle}`); // eg. /{handle}/settings/profile
    return bl;
  }, [allHandles, handle, navHistory?.settingsBackPath]);

  return (
    <aside className="fixed left-0 top-14 z-30 hidden h-[100vh] max-h-[100vh] w-14 shrink-0 flex-col overflow-y-auto bg-muted px-3 py-3 md:sticky md:flex md:w-56">
      <WorkspaceSwitcher />

      {isSettings && (
        <Link href={settingsBackLink} passHref>
          <div className="flex flex-row items-center pt-3">
            <Icon.chevronLeft className="mr-1 h-4 w-4" />
            <Text variant="md/bold">Settings</Text>
          </div>
        </Link>
      )}

      <ScrollArea className="h-full items-center py-3">
        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-col gap-1">
            {topLinks.map((item, index) => {
              if (
                item.workspaceFilters &&
                !item.workspaceFilters
                  .map((filter) => workspace[filter])
                  .includes(true)
              ) {
                return null;
              }

              return (
                <Fragment key={index}>
                  <NavItem item={item} />
                </Fragment>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

function NavItem(props: { item: SidebarNavItem }) {
  const NavIcon = props.item.icon ? Icon[props.item.icon] : null;

  const isCurrent = usePathnameMatchesCurrentPath(props.item.href ?? "");

  return (
    <Link
      href={props.item.href ?? "#"}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary",
        isCurrent && "bg-secondary",
      )}
      passHref
    >
      {NavIcon && <NavIcon className="h-[15px] w-[15px]" />}
      <Text variant="sm/medium">{props.item.title}</Text>
    </Link>
  );
}
