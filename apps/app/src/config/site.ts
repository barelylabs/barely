// import { SidebarNavItem } from '~/types/nav';

interface SiteConfig {
  name: string;
  description: string;
  links: {
    twitter: string;
    github: string;
  };
  // sidebarNav: SidebarNavItem[];
}

export const siteConfig: SiteConfig = {
  name: "barely.io",
  description: "Tools for artists.",
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/shadcn/ui",
  },
  // sidebarNav: [

  // 			{
  // 				title: 'All',
  // 				href: '/campaigns',
  // 				icon: 'plus',
  // 				items: [],
  // 			},
  // 			{
  // 				title: 'Create',
  // 				href: '/campaigns/playlist-pitch',
  // 				icon: 'plus',
  // 				items: [],
  // 			},

  // 			{
  // 				title: 'Playlists',
  // 				href: '/playlists',
  // 				icon: 'music',
  // 				items: [],
  // 			},
  // 			{
  // 				title: 'Screen',
  // 				href: '/screen',
  // 				icon: 'filter',
  // 				userFilters: ['pitchScreening'],
  // 				items: [],
  // 			},
  // 			{
  // 				title: 'Review',
  // 				href: '/review',
  // 				icon: 'star',
  // 				userFilters: ['pitchReviewing'],
  // 				items: [],
  // 			},

  // 	{
  // 		title: 'Settings',
  // 		// userFilters: ['pitchReviewing', 'pitchScreening'],
  // 		// href: '/accounts',
  // 		icon: 'settings',
  // 		items: [
  // 			{
  // 				title: 'Accounts',
  // 				href: '/accounts',
  // 				icon: 'settings',
  // 				items: [],
  // 			},
  // 		],
  // 	},
  // ],
};
