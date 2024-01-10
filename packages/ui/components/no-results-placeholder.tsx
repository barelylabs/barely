import type { ReactNode } from "react";

import type { IconSelection } from "../elements/icon";
import { Icon } from "../elements/icon";
import { H, Text } from "../elements/typography";

export function NoResultsPlaceholder(props: {
  title?: string;
  subtitle?: string;
  button?: ReactNode;
  icon?: IconSelection;
}) {
  const IconComponent = props.icon ? Icon[props.icon] : null;
  return (
    <div className="flex h-full max-h-[500px] flex-col items-center justify-center gap-y-3 rounded-lg border border-dashed px-6 py-16">
      {IconComponent && <IconComponent className="h-10 w-10" />}

      <H size="4">{props.title ?? `There's nothing here.`}</H>
      {props.subtitle && (
        <Text variant="xs/light">Create a new link to get started.</Text>
      )}
      {props.button && props.button}
    </div>
  );
}
