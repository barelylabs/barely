import type { User } from '@barely/lib/server/routes/user/user.schema';
import type { Workspace } from '@barely/lib/server/routes/workspace/workspace.schema';
import type { Icon } from '@barely/ui/elements/icon';

export interface SidebarNavItem {
	title: string;
	href?: string;
	disabled?: boolean;
	external?: boolean;
	icon?: keyof typeof Icon;
	label?: string;
	userFilters?: (keyof User)[];
	workspaceFilters?: (keyof Workspace)[];
}
