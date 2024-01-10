"use client";

import * as React from "react";
import { cn } from "@barely/lib/utils/cn";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { debounce } from "perfect-debounce";

export type SliderProps = Omit<
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  "onValueChange"
> & {
  growThumb?: boolean;
  isError?: boolean;
  debounce?: number;
  onValueChange?: (value: number) => void;
  onValueChangeDebounced?: (value: number) => void;
};

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, onValueChangeDebounced, ...props }, ref) => {
  const debouncedOnChangeMemo = React.useMemo(() => {
    if (!onValueChangeDebounced) return undefined;
    return debounce(onValueChangeDebounced, props.debounce ?? 400);
  }, [onValueChangeDebounced, props.debounce]);

  const handleDebouncedChange = React.useCallback(
    async (value: number) => {
      await debouncedOnChangeMemo?.(value);
    },
    [debouncedOnChangeMemo],
  );

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
      onValueChange={(values) => {
        const v = values[0];

        if (!v) return;

        props.onValueChange?.(v);
        if (!onValueChangeDebounced) return;
        handleDebouncedChange(v).catch((err) => console.error(err));
      }}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>

      {!!props.value &&
        props.value.map((v, i) => {
          const percentage = (v / (props.max ?? 100)) * 100;
          return (
            <SliderPrimitive.Thumb
              key={i}
              className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              style={{
                transform: props.growThumb
                  ? `scale(${1 + (0.5 * percentage) / 100})`
                  : "",
              }}
            ></SliderPrimitive.Thumb>
          );
        })}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
