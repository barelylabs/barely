import { redirect } from "next/navigation";
import { getDefaultWorkspaceOfCurrentUser } from "@barely/lib/server/auth/auth.fns";
import { auth } from "@barely/server/auth";

import { SidebarNav } from "~/app/[handle]/_components/dash-sidebar-nav";
import { NewWorkspaceModal } from "~/app/[handle]/_components/new-workspace-modal";
import { WorkspaceProviders } from "~/app/[handle]/_components/providers";
import { DashboardHeader } from "./_components/dash-header";

interface DashboardLayoutProps {
  params: { handle: string };
  children: React.ReactElement;
}

export default async function DashboardLayout({
  params,
  children,
}: DashboardLayoutProps) {
  const session = await auth();

  if (!session) return redirect("/login");

  const user = session.user;

  const userWorkspace = user.workspaces.find((w) => w.type === "personal");

  if (userWorkspace) user.image = userWorkspace.imageUrl;

  const currentWorkspace = user.workspaces.find(
    (w) => w.handle === params.handle,
  );

  if (!currentWorkspace) {
    const defaultWorkspace = await getDefaultWorkspaceOfCurrentUser();
    return redirect(`${defaultWorkspace.handle}/links`);
  }

  return (
    <WorkspaceProviders user={user} workspace={currentWorkspace}>
      <div className="mx-auto flex  w-full flex-1 flex-row">
        <SidebarNav workspace={currentWorkspace} />
        <NewWorkspaceModal />
        <div className="flex h-[100vh] w-full flex-col">
          <DashboardHeader />
          <div className="grid h-fit grid-cols-1   gap-6 overflow-y-scroll px-6 py-6 lg:py-10">
            {children}
          </div>
        </div>
      </div>
    </WorkspaceProviders>
  );
}
