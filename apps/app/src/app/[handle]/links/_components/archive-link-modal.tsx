"use client";

import { useCallback } from "react";
import { atomWithToggle } from "@barely/atoms/atom-with-toggle";
import { api } from "@barely/server/api/react";
import { BlurImage } from "@barely/ui/elements/blur-image";
import { Button } from "@barely/ui/elements/button";
import { Modal, ModalBody, ModalHeader } from "@barely/ui/elements/modal";
import { useAtom } from "jotai";

import { editLinkAtom } from "~/app/[handle]/links/_components/link-modal";

export const showArchiveLinkModalAtom = atomWithToggle(false);

export function ArchiveLinkModal() {
  const [editLink, setEditLink] = useAtom(editLinkAtom);
  const [, setShowArchiveLinkModal] = useAtom(showArchiveLinkModalAtom);
  const { mutate: updateLink, isPending } = api.link.update.useMutation();

  const archiveLink = useCallback(() => {
    if (!editLink) return;

    console.log("archiving link", editLink.key);

    updateLink({ id: editLink.id, archived: true });
    setShowArchiveLinkModal(false);
    setEditLink(null);
  }, [editLink, setEditLink, setShowArchiveLinkModal, updateLink]);

  if (!editLink) return null;

  return (
    <Modal showModalAtom={showArchiveLinkModalAtom} className="h-fit max-w-md">
      <ModalHeader
        icon="link"
        iconOverride={
          editLink.favicon ? (
            <BlurImage
              src={editLink.favicon}
              alt="Logo"
              className="mx-auto h-10 w-10"
              width={20}
              height={20}
            />
          ) : null
        }
        title={`Archive ${editLink.domain}/${editLink.key}`}
        subtitle={`Archived links will still work - they just won't show up on your main dashboard.`}
      />
      <ModalBody>
        <Button loading={isPending} onClick={archiveLink} fullWidth>
          Confirm archive
        </Button>
      </ModalBody>
    </Modal>
  );
}
