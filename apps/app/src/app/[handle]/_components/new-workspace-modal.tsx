"use client";

import type { z } from "zod";
import { useRouter } from "next/navigation";
import { atomWithToggle } from "@barely/atoms/atom-with-toggle";
import { useZodForm } from "@barely/hooks/use-zod-form";
import { api } from "@barely/server/api/react";
import { createWorkspaceSchema } from "@barely/server/workspace.schema";
import { Modal, ModalBody, ModalHeader } from "@barely/ui/elements/modal";
import { Form, SubmitButton } from "@barely/ui/forms";
import { SelectField } from "@barely/ui/forms/select-field";
import { TextField } from "@barely/ui/forms/text-field";
import { useAtom } from "jotai";

import type { SelectFieldOption } from "@barely/ui/forms/select-field";

export const showNewWorkspaceModalAtom = atomWithToggle(false);

export function NewWorkspaceModal() {
  const [newWorkspaceModalOpen, setNewWorkspaceModalOpen] = useAtom(
    showNewWorkspaceModalAtom,
  );
  const router = useRouter();

  const form = useZodForm({
    schema: createWorkspaceSchema,
    defaultValues: {
      name: "",
      handle: "",
      type: "creator",
    },
  });

  const typeOptions: SelectFieldOption<
    Exclude<
      z.infer<typeof createWorkspaceSchema.shape.type>,
      undefined | "personal"
    >
  >[] = [
    { label: "Creator", value: "creator" },
    { label: "Band", value: "band" },
    { label: "Solo Artist", value: "solo_artist" },
    { label: "Product", value: "product" },
  ];

  const { mutateAsync: createWorkspace } = api.workspace.create.useMutation({
    onSuccess: (data) => {
      router.push(`/${data.handle}/settings/profile`);
      setNewWorkspaceModalOpen(false);
    },
  });

  const onSubmit = async (data: z.infer<typeof createWorkspaceSchema>) => {
    await createWorkspace(data);
  };

  return (
    <Modal
      showModal={newWorkspaceModalOpen}
      setShowModal={setNewWorkspaceModalOpen}
      className="max-w-md"
    >
      <ModalHeader icon="logo" title="Create a new workspace" />

      <ModalBody>
        <Form form={form} onSubmit={onSubmit}>
          <TextField
            control={form.control}
            name="name"
            label="Workspace Name"
            infoTooltip="This is your workspace name on Barely"
          />
          <TextField
            control={form.control}
            name="handle"
            label="Workspace Handle"
            infoTooltip={`This is your workspace handle on Barely. It'll be used for your transparent links and bio.`}
          />
          <SelectField
            control={form.control}
            name="type"
            label="Workspace Type"
            infoTooltip={`What type of workspace is this?`}
            options={typeOptions}
          />
          <SubmitButton fullWidth>Create Workspace</SubmitButton>
        </Form>
      </ModalBody>
    </Modal>
  );
}
