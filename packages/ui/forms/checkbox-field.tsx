import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { FieldProps } from "./field-wrapper";
import { Checkbox } from "../elements/checkbox";
import { FieldMessages } from "./field-wrapper";
import { FieldControl, FieldLabel, FormFieldContext, FormItem } from "./index";

export const CheckboxField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: FieldProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        {...props}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FieldControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FieldControl>
            <div className="space-y-1 leading-none">
              <FieldLabel>{props.label}</FieldLabel>
              <FieldMessages
                {...{ description: props.description, hint: props.hint }}
              />
              {/* <FieldDescription>{props.description}</FieldDescription>
							<FieldErrorMessage /> */}
            </div>
          </FormItem>
        )}
      />
    </FormFieldContext.Provider>
  );
};
