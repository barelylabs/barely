"use client";

import { useModalHotKeys } from "@barely/lib/hooks/use-modal-hot-keys";

import { useLinkContext } from "~/app/[handle]/links/_components/link-context";

export function LinkHotkeys() {
  const {
    linkSelection,
    setShowCreateLinkModal,
    setShowUpdateLinkModal,
    setShowArchiveLinkModal,
    setShowDeleteLinkModal,
  } = useLinkContext();

  useModalHotKeys({
    setShowCreateModal: setShowCreateLinkModal,
    setShowUpdateModal: setShowUpdateLinkModal,
    setShowArchiveModal: setShowArchiveLinkModal,
    setShowDeleteModal: setShowDeleteLinkModal,
    itemSelected: linkSelection !== "all" && !!linkSelection.size,
  });

  return null;
}
