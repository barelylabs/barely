import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { FieldProps } from "./field-wrapper";
import { Toggle } from "../elements/toggle";
import { FieldMessages } from "./field-wrapper";
import { FieldControl, FormFieldContext, FormItem } from "./index";

export const ToggleField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  hint,
  ...props
}: FieldProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        {...props}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FieldControl>
              <Toggle pressed={field.value} onPressedChange={field.onChange} />
            </FieldControl>
            <FieldMessages {...{ description: props.description, hint }} />
          </FormItem>
        )}
      />
    </FormFieldContext.Provider>
  );
};
