// https://ui.shadcn.com/docs/primitives/progress

"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@barely/lib/utils/cn";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva } from "class-variance-authority";

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        lg: "h-4",
        md: "h-3",
        sm: "h-2.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
    VariantProps<typeof progressVariants>
>(({ className, value, max, size, ...props }, ref) => {
  const progressClass = progressVariants({ size });
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(progressClass, className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary/50 transition-all "
        style={{
          transform: `translateX(-${
            100 - ((value ?? 0) / (max ?? 100)) * 100
          }%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

/* usage 

import { Progress } from "@/components/ui/progress"

<Progress value={33} />

*/
