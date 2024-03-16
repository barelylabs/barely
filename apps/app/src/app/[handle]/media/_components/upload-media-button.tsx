"use client";

import { Button } from "@barely/ui/elements/button";

import { useMediaContext } from "~/app/[handle]/media/_components/media-context";

export function UploadMediaButton() {
  const { setShowUploadMediaModal } = useMediaContext();

  return (
    <Button
      onClick={() => {
        setShowUploadMediaModal(true);
      }}
      className="space-x-3"
    >
      <p>Upload Media</p>
      <kbd className="hidden rounded bg-zinc-700 px-2 py-0.5 text-xs font-light text-gray-400 transition-all duration-75 group-hover:bg-gray-100 group-hover:text-gray-500 md:inline-block">
        U
      </kbd>
    </Button>
  );
}
