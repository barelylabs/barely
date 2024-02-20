"use client";

import { Button } from "@barely/ui/elements/button";
import { useSetAtom } from "jotai";

import {
  editLinkAtom,
  showLinkModalAtom,
} from "~/app/[handle]/links/_components/link-modal";

export function NewLinkButton() {
  const setEditLink = useSetAtom(editLinkAtom);
  const setShowLinkModal = useSetAtom(showLinkModalAtom);

  return (
    <Button
      onClick={() => {
        setEditLink(null);
        setShowLinkModal(true);
      }}
      className="space-x-3"
    >
      <p>New Link</p>
      <kbd className="hidden rounded bg-zinc-700 px-2 py-0.5 text-xs font-light text-gray-400 transition-all duration-75 group-hover:bg-gray-100 group-hover:text-gray-500 md:inline-block">
        C
      </kbd>
    </Button>
  );
}
