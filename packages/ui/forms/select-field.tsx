import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { InputProps } from "../elements/input";
import type { FieldProps } from "./field-wrapper";
import { FormControl } from "../elements/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../elements/select";
import { FieldWrapper } from "./field-wrapper";
import { FormFieldContext, FormItem } from "./index";

export interface SelectFieldOption<TOption extends string | number> {
  value: TOption;
  label: ReactNode;
}

export const SelectField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  hint,
  ...props
}: FieldProps<TFieldValues, TName> &
  InputProps & {
    options: SelectFieldOption<Extract<TFieldValues[TName], string | number>>[];
  }) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        {...props}
        disabled={props.disableController}
        render={({ field }) => (
          <FormItem>
            <FieldWrapper {...props} hint={hint}>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={props.disabled}
              >
                <FormControl>
                  <SelectTrigger className={props.className}>
                    <SelectValue placeholder={props.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {props.options.map(
                    (option: SelectFieldOption<string | number>) => (
                      <SelectItem
                        key={option.value}
                        value={
                          typeof option.value === "string"
                            ? option.value
                            : option.value.toString()
                        }
                      >
                        {option.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              {/* <FieldDescription>{props.description}</FieldDescription>
						<FieldHint
							onFocus={() => setFocus(true)}
							onBlur={() => setFocus(false)}
							className={focus ? 'block' : 'hidden'}
							>
							{hint}
						</FieldHint>
						<FieldErrorMessage /> */}
            </FieldWrapper>
          </FormItem>
        )}
      />
    </FormFieldContext.Provider>
  );
};
