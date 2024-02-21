import type { FieldPath, FieldValues } from "react-hook-form";
import { useState } from "react";
import { Controller } from "react-hook-form";

import type { TextareaProps } from "../elements/textarea";
// import { Input, InputProps } from '../elements/input';
import type { FieldProps } from "./field-wrapper";
import { Textarea } from "../elements/textarea";
import {
  FieldControl,
  FieldDescription,
  // FieldErrorIcon,
  FieldErrorMessage,
  FieldHint,
  FieldLabel,
  FormFieldContext,
  FormItem,
} from "./index";

export const TextAreaField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  hint,
  ...props
}: FieldProps<TFieldValues, TName> &
  TextareaProps & {
    isValidating?: boolean;
  }) => {
  const [focus, setFocus] = useState(false);

  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        {...props}
        disabled={props.disableController}
        render={({ field, fieldState }) => {
          return (
            <FormItem>
              <FieldLabel>{props.label}</FieldLabel>
              <FieldControl>
                <Textarea
                  {...field}
                  {...props}
                  onChange={(e) => {
                    field.onChange(e);
                    props.onChange?.(e);
                  }}
                  isError={!!fieldState?.error?.message}
                />
              </FieldControl>
              <FieldDescription>{props.description}</FieldDescription>
              <FieldHint
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                className={focus ? "block" : "hidden"}
              >
                {hint}
              </FieldHint>
              <FieldErrorMessage />
            </FormItem>
          );
        }}
      />
    </FormFieldContext.Provider>
  );
};
