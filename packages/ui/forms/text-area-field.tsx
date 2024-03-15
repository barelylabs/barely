import type { FieldPath, FieldValues } from "react-hook-form";
import { useState } from "react";
import { Controller } from "react-hook-form";

import type { TextareaProps } from "../elements/textarea";
import type { FieldProps } from "./field-wrapper";
import { Textarea } from "../elements/textarea";
import { FieldWrapper } from "./field-wrapper";
import { FieldControl, FormFieldContext, FormItem } from "./index";

export const TextAreaField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  hint,
  infoTooltip,
  labelButton,
  allowEnableConfirmMessage,
  ...props
}: FieldProps<TFieldValues, TName> &
  TextareaProps & {
    isValidating?: boolean;
  }) => {
  const [isDisabled, setIsDisabled] = useState(props.disabled);

  const toggleDisabled = () => {
    const userConfirmed = window.confirm(
      allowEnableConfirmMessage ??
        "Are you sure you want to unlock this field?",
    );
    if (userConfirmed) {
      setIsDisabled((prev) => !prev);
    }
  };

  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        {...props}
        disabled={props.disableController}
        render={({ field, fieldState }) => {
          return (
            <FormItem>
              <FieldWrapper
                {...props}
                infoTooltip={infoTooltip}
                labelButton={labelButton}
                hint={hint}
                isDisabled={isDisabled}
                toggleDisabled={toggleDisabled}
              >
                <FieldControl>
                  <Textarea
                    {...field}
                    {...props}
                    onChange={(e) => {
                      field.onChange(e);
                      props.onChange?.(e);
                    }}
                    isError={!!fieldState.error?.message}
                  />
                </FieldControl>
              </FieldWrapper>
            </FormItem>
          );
        }}
      />
    </FormFieldContext.Provider>
  );
};
