import * as React from "react";
import { cn } from "@barely/lib/utils/cn";
import { debounce } from "perfect-debounce";

export interface InputAddonProps {
  onChangeDebounced?: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;
  debounce?: number;
  isError?: boolean;
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  InputAddonProps;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onChangeDebounced, isError, ...props }, ref) => {
    const onChangeDebouncedMemo = React.useMemo(() => {
      if (!onChangeDebounced) return undefined;
      return debounce(onChangeDebounced, props.debounce ?? 400);
    }, [onChangeDebounced, props.debounce]);

    const handleDebouncedChange = React.useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        await onChangeDebouncedMemo?.(e);
      },
      [onChangeDebouncedMemo],
    );

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2  disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-input focus-visible:ring-offset-background",
          isError &&
            "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/60",
          className,
        )}
        {...props}
        onChange={(e) => {
          props.onChange?.(e);
          if (!onChangeDebounced) return;
          handleDebouncedChange(e).catch((err) => console.error(err));
        }}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
