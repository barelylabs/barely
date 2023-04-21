import { SessionUser } from '@barely/auth/auth-options';

import { Icon } from '@barely/ui/elements/icon';

export interface NavItem {
	title: string;
	href?: string;
	disabled?: boolean;
	external?: boolean;
	icon?: keyof typeof Icon;
	label?: string;
	userFilters?: (keyof SessionUser)[];
}

export interface NavItemWithChildren extends NavItem {
	items: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}

// q: how to call an Icon based on icon prop?
