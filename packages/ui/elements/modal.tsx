// ref: https://github.com/steven-tey/dub/blob/a2a4f43eb5f606eb159a59e882418aefdbee9264/app/ui/modal.tsx
"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { atomWithToggle } from "@barely/lib/atoms/atom-with-toggle";
import { useMediaQuery } from "@barely/lib/hooks/use-media-query";
import { cn } from "@barely/lib/utils/cn";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom } from "jotai";
import { Drawer } from "vaul";

import type { AtomWithToggle } from "@barely/lib/atoms/atom-with-toggle";

import type { IconSelection } from "./icon";
import { Icon } from "./icon";
import { H, Text } from "./typography";

interface ModalProps {
  children: ReactNode;
  className?: string;
  dialogOnly?: boolean;
  showModalAtom?: AtomWithToggle;
  onClose?: () => void;
  preventDefaultClose?: boolean;
}

function Modal(props: ModalProps) {
  const router = useRouter();

  const showModalAtom = props.showModalAtom ?? atomWithToggle(false);

  const [showModal, setShowModal] = useAtom(showModalAtom);

  const closeModal = ({ dragged }: { dragged?: boolean } = {}) => {
    if (props.preventDefaultClose && !dragged) return;

    // fire onClose event if provided
    props.onClose?.();

    // if setShowModal is defined, use it to close modal
    if (props.showModalAtom) {
      setShowModal(false);
    } else {
      router.back();
    }
  };

  const { isMobile } = useMediaQuery();

  if (isMobile && !props.dialogOnly) {
    return (
      <Drawer.Root
        open={props.showModalAtom ? showModal : true}
        onOpenChange={(open) => {
          if (!open) {
            closeModal({ dragged: true });
          }
        }}
      >
        <Drawer.Overlay className="fixed inset-0 z-40 bg-gray-100 bg-opacity-10 backdrop-blur" />
        <Drawer.Portal>
          <Drawer.Content
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 mt-24 h-fit rounded-t-[10-px] border-t border-gray-200 bg-white",
              props.className,
            )}
          >
            <div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-inherit">
              <div className="my-3 h-1 w-12 rounded-full bg-gray-300" />
            </div>
            {props.children}
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog.Root
      open={props.showModalAtom ? showModal : true}
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          // for detecting when there's an active opened modal
          id="modal-backdrop"
          className="animate-fade-in fixed inset-0 z-40 bg-gray-100 bg-opacity-50 backdrop-blur-md"
        />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "animate-scale-in fixed inset-0 z-40 m-auto h-fit max-h-[90vh] w-full max-w-screen-lg overflow-hidden border border-gray-200 bg-white p-0 shadow-xl md:rounded-2xl",
            "focus:outline-none",
            props.className,
          )}
        >
          {props.children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ModalHeaderProps {
  icon?: IconSelection;
  iconOverride?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

function ModalHeader(props: ModalHeaderProps) {
  const IconComponent = props.icon ? Icon[props.icon] : null;

  return (
    <div className="flex flex-col items-center gap-3 border-b px-6 py-6 text-center sm:px-10">
      {props.iconOverride ? (
        props.iconOverride
      ) : IconComponent ? (
        <IconComponent className="h-10 w-10" />
      ) : null}

      {props.title ? <H size="4">{props.title}</H> : null}
      {props.subtitle ? (
        <Text variant="sm/normal">{props.subtitle}</Text>
      ) : null}
      {props.children}
    </div>
  );
}

interface ModalBodyProps {
  children?: ReactNode;
  className?: string;
}

function ModalBody(props: ModalBodyProps) {
  return (
    <div
      className={cn("flex flex-col gap-3 bg-slate-50 p-6 ", props.className)}
    >
      {props.children}
    </div>
  );
}

function ModalFooter(props: { children?: ReactNode }) {
  //<div className='flex flex-col gap-2 border-t p-6 text-center'>
  return (
    <div className="flex flex-col gap-3 border-t p-6 text-center">
      {props.children}
    </div>
  );
}

export { Modal, ModalHeader, ModalBody, ModalFooter };
