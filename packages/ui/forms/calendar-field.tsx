import type { FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@barely/lib/utils/cn";
import { format } from "date-fns";
import { Controller } from "react-hook-form";

import type { InputProps } from "../elements/input";
import type { FieldProps } from "./field-wrapper";
import { Button } from "../elements/button";
import { Icon } from "../elements/icon";
import { Input } from "../elements/input";
import { Popover, PopoverTrigger } from "../elements/popover";
import { FieldMessages } from "./field-wrapper";
import {
  FieldControl,
  FieldErrorIcon,
  FieldLabel,
  FormFieldContext,
  FormItem,
} from "./index";

export const CalendarField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  hint,
  ...props
}: FieldProps<TFieldValues, TName> & InputProps) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        {...props}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FieldLabel>{props.label}</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FieldControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <Icon.calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FieldControl>
              </PopoverTrigger>
            </Popover>
            <FieldControl>
              <div className="relative">
                <Input type="date" placeholder={props.placeholder} {...field} />
                <FieldErrorIcon />
              </div>
            </FieldControl>
            <FieldMessages {...{ description: props.description, hint }} />
            {/* <FieldDescription>{props.description}</FieldDescription>
						<FieldErrorMessage /> */}
          </FormItem>
        )}
      />
    </FormFieldContext.Provider>
  );
};
