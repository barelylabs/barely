import type { Icon } from '@barely/ui/icon';
import type { User, Workspace } from '@barely/validators';

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
