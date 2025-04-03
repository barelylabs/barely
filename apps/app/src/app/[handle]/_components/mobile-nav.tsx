'use client';

import * as React from 'react';
import Link from 'next/link';

import { Button } from '@barely/ui/elements/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	// DropdownMenuGroup,
	DropdownMenuItem,
	// DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@barely/ui/elements/dropdown-menu';
import { Icon } from '@barely/ui/elements/icon';
import { ScrollArea } from '@barely/ui/elements/scroll-area';

// import { docsConfig } from '@/config/docs';
import { siteConfig } from '~/config/site';

export function MobileNav() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					look='ghost'
					className='-ml-4 text-base hover:bg-transparent focus:ring-0 focus:ring-offset-0 md:hidden'
				>
					<Icon.rocket className='mr-2 h-4 w-4' /> <span className='font-bold'>Menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='start'
				sideOffset={24}
				alignOffset={4}
				className='w-[300px] overflow-scroll'
			>
				<DropdownMenuItem asChild>
					<Link href='/' className='flex items-center'>
						<Icon.rocket className='mr-2 h-4 w-4' /> {siteConfig.name}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<ScrollArea className='h-[400px]'>
					{/* {docsConfig.sidebarNav?.map(
						(item, index) =>
							item.href && (
								<DropdownMenuItem key={index} asChild>
									<Link href={item.href}>{item.title}</Link>
								</DropdownMenuItem>
							),
					)} */}
					{/* {docsConfig.sidebarNav.map((item, index) => (
						<DropdownMenuGroup key={index}>
							<DropdownMenuSeparator
								className={cn({
									hidden: index === 0,
								})}
							/>
							<DropdownMenuLabel>{item.title}</DropdownMenuLabel>
							<DropdownMenuSeparator className='-mx-2' />
							{item?.items?.length &&
								item.items.map(item => (
									<DropdownMenuItem key={item.title} asChild>
										{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}
									</DropdownMenuItem>
								))}
						</DropdownMenuGroup>
					))} */}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
