import type { ReactNode } from "react";
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

import type { FieldLabelAddonProps } from ".";
import { FieldDescription, FieldErrorMessage, FieldHint, FieldLabel } from ".";

export interface FieldMessagesProps {
  description?: ReactNode;
  hint?: ReactNode;
  focus?: boolean;
}

export type FieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label?: ReactNode;
  disabled?: boolean;
} & FieldLabelAddonProps &
  FieldMessagesProps;

export function FieldMessages(props: FieldMessagesProps) {
  return (
    <>
      {props.description && (
        <FieldDescription>{props.description}</FieldDescription>
      )}
      {props.hint && (
        <FieldHint className={props.focus ? "block" : "hidden"}>
          {props.hint}
        </FieldHint>
      )}
      <FieldErrorMessage />
    </>
  );
}

export function FieldWrapper({
  label,
  labelButton,
  infoTooltip,
  ...props
}: {
  children: ReactNode;
  label?: ReactNode;
  labelButton?: ReactNode;
} & FieldLabelAddonProps &
  FieldMessagesProps) {
  return (
    <>
      {label && (
        <FieldLabel infoTooltip={infoTooltip} labelButton={labelButton}>
          {label}
        </FieldLabel>
      )}

      {props.children}
      <FieldMessages {...props} />
    </>
  );
}
