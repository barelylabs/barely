// import { useState } from 'react';
import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { InputProps } from "../elements/input";
import type { FieldProps } from "./field-wrapper";
import { Input } from "../elements/input";
import { FieldWrapper } from "./field-wrapper";
import {
  FieldControl,
  FieldErrorIcon,
  FormFieldContext,
  FormItem,
} from "./index";

export const TextField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  hint,
  isValidating,
  infoTooltip,
  labelButton,
  ...props
}: FieldProps<TFieldValues, TName> &
  InputProps & {
    isValidating?: boolean;
  }) => {
  // const [focus, setFocus] = useState(false);

  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        {...props}
        render={({ field, fieldState }) => {
          return (
            <FormItem className="flex-grow">
              <FieldWrapper
                {...props}
                infoTooltip={infoTooltip}
                labelButton={labelButton}
                hint={hint}
              >
                <FieldControl>
                  <div className="relative">
                    <Input
                      type={props.type}
                      {...field}
                      {...props}
                      onChange={(e) => {
                        field.onChange(e);
                        props.onChange?.(e);
                      }}
                      isError={!!fieldState?.error?.message}
                    />
                    <FieldErrorIcon isValidating={isValidating} />
                  </div>
                </FieldControl>
              </FieldWrapper>
            </FormItem>
          );
        }}
      />
    </FormFieldContext.Provider>
  );
};
