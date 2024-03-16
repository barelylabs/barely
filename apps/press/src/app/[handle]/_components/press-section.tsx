import React from "react";
import { cn } from "@barely/lib/utils/cn";
import { H } from "@barely/ui/elements/typography";

export const Section = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    id: string;
    className?: string;
  }
>(({ children, id, className }, ref) => {
  return (
    <section
      ref={ref}
      id={id}
      className={cn("w-full bg-accent py-6", className)}
    >
      {children}
    </section>
  );
});
Section.displayName = "Section";

export const SectionDiv = React.forwardRef<
  HTMLDivElement,
  {
    children?: React.ReactNode;
    className?: string;
    title?: string;
  }
>(({ children, className, title }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "container flex flex-col space-y-2 px-6 sm:px-8 md:px-10",
        className,
      )}
    >
      {title && (
        <H size="2" className="mb-4">
          {title}
        </H>
      )}
      {children}
    </div>
  );
});
SectionDiv.displayName = "SectionDiv";
