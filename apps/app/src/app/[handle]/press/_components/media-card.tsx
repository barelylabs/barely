"use client";

import BackgroundImage from "@barely/ui/elements/background-image";
import { Button } from "@barely/ui/elements/button";
import { GridItemCheckbox } from "@barely/ui/elements/grid-list";
import { Tooltip } from "@barely/ui/elements/tooltip";

import type { FileRecord } from "@barely/lib/server/file.schema";

export interface MediaCardProps {
  file: FileRecord;
  removeFile?: () => void;
  isSelectable?: boolean;
}

export function MediaCard({ file, removeFile, isSelectable }: MediaCardProps) {
  return (
    <Tooltip content={file.name} side="bottom" delayDuration={700}>
      <div className="group relative z-[1] flex h-32 w-full flex-grow flex-col rounded-sm">
        {isSelectable && (
          <GridItemCheckbox
            slot="selection"
            className="absolute left-2 top-2 z-10"
          />
        )}
        {file.type === "image" && (
          <BackgroundImage src={file.src} alt={file.name} />
        )}
        {!!removeFile && (
          <Button
            startIcon="x"
            variant="icon"
            pill
            size="xs"
            look="muted"
            onClick={removeFile}
            className="absolute -right-[6px] -top-[6px] z-10 drop-shadow-md"
          />
        )}
      </div>
    </Tooltip>
  );
}
