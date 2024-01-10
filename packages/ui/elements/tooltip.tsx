"use client";

import * as React from "react";
import { useMediaQuery } from "@barely/lib/hooks/use-media-query";
import { cn } from "@barely/lib/utils/cn";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Drawer } from "vaul";

import { Button } from "./button";
import { Icon } from "./icon";

const TooltipProvider = TooltipPrimitive.Provider;

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode | string;
  side?: "top" | "bottom" | "left" | "right";
  desktopOnly?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const Tooltip = ({
  children,
  content,
  side = "top",
  desktopOnly,
  className,
  fullWidth,
}: TooltipProps) => {
  const { isMobile } = useMediaQuery();

  if (isMobile && !desktopOnly) {
    return (
      <Drawer.Root>
        <Drawer.Trigger
          className={`${fullWidth ? "w-full" : "inline-flex"} md:hidden`}
        >
          {children}
        </Drawer.Trigger>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-gray-100 bg-opacity-10 backdrop-blur" />
        <Drawer.Portal>
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 rounded-t-[10px] border-t border-gray-200 bg-white">
            <div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-inherit">
              <div className="my-3 h-1 w-12 rounded-full bg-gray-300" />
            </div>
            <div
              className={cn(
                "flex min-h-[150px] w-full items-center justify-center overflow-hidden bg-white align-middle text-sm text-gray-700 shadow-xl",
                className,
              )}
            >
              {typeof content === "string" ? (
                <span className="block text-center">{content}</span>
              ) : (
                content
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger className="md:inline-flex" asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={8}
          side={side}
          className="animate-slide-up-fade z-[99] items-center overflow-hidden rounded-md border border-gray-200 bg-white shadow-md md:block"
        >
          {typeof content === "string" ? (
            <div className="block max-w-xs px-4 py-2 text-center text-sm text-gray-700">
              {content}
            </div>
          ) : (
            content
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};
Tooltip.displayName = TooltipPrimitive.Tooltip.displayName;

const TooltipTrigger = TooltipPrimitive.Trigger;

interface TooltipContentProps {
  title: string;
  cta?: string;
  href?: string;
  target?: string;
  onClick?: () => void;
  closeOnClick?: boolean;
}

export function TooltipContent({
  title,
  cta,
  href,
  closeOnClick,
  onClick,
}: TooltipContentProps) {
  return (
    <div className="flex flex-col items-center space-y-3 p-4 text-center md:max-w-xs">
      <p className="text-sm text-gray-700">{title}</p>
      {cta && (
        <Button
          size="sm"
          fullWidth
          href={href}
          onClick={() => {
            if (closeOnClick) {
              const event = new KeyboardEvent("keydown", { key: "Escape" });
              document.dispatchEvent(event);
            }
            if (onClick) {
              onClick();
            }
          }}
        >
          {cta}
        </Button>
      )}
    </div>
  );
}
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export function SimpleTooltipContent({
  title,
  cta,
  href,
}: {
  title: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="max-w-xs px-4 py-2 text-center text-sm text-gray-700">
      {title}{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex text-gray-500 underline underline-offset-4 hover:text-gray-800"
      >
        {cta}
      </a>
    </div>
  );
}

export function InfoTooltip({
  content,
}: {
  content: React.ReactNode | string;
}) {
  return (
    <Tooltip content={content}>
      <Icon.help
        className="h-4 w-4 text-gray-500"
        // onClick={onPromise(async event => {
        // 	const target = event.currentTarget;
        // 	if (!target) return;
        // 	await wait(0);
        // 	target.blur();
        // 	target.focus();
        // })}
      />
    </Tooltip>
  );
}

// export function NumberTooltip({
// 	value,
// 	unit = 'total clicks',
// 	children,
// 	lastClicked,
// }: {
// 	value?: number | null;
// 	unit?: string;
// 	children: React.ReactNode;
// 	lastClicked?: Date | null;
// }) {
// 	if ((!value || value < 1000) && !lastClicked) {
// 		return children;
// 	}
// 	return (
// 		<Tooltip
// 			content={
// 				<div className='block max-w-xs px-4 py-2 text-center text-sm text-gray-700'>
// 					<p className='text-sm font-semibold text-gray-700'>
// 						{nFormatter(value || 0, { full: true })} {unit}
// 					</p>
// 					{lastClicked && (
// 						<p className='mt-1 text-xs text-gray-500' suppressHydrationWarning>
// 							Last clicked {timeAgo(lastClicked, { withAgo: true })}
// 						</p>
// 					)}
// 				</div>
// 			}
// 		>
// 			{children}
// 		</Tooltip>
// 	);
// }

export { Tooltip, TooltipTrigger, TooltipProvider };

/* usage

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

*/
