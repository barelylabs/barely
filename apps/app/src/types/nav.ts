import type { User } from '@barely/validators';
import type { Workspace } from '@barely/validators';
import type { Icon } from '@barely/ui/icon';

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
