"use client";

// import { useToast } from '@barely/toast';
import type { z } from "zod";
import { useEffectOnce } from "@barely/hooks/use-effect-once";
import { useWorkspace } from "@barely/hooks/use-workspace";
import { useZodForm } from "@barely/hooks/use-zod-form";
import { insertMetaPixelSchema } from "@barely/server/analytics-endpoint-schema";
import { api } from "@barely/server/api/react";
import { SettingsCard } from "@barely/ui/components/settings-card";
import { TextAreaField } from "@barely/ui/forms/text-area-field";
import { TextField } from "@barely/ui/forms/text-field";
import { useSetAtom } from "jotai";

// import { useToast } from '@barely/ui/hooks/use-toast';

import { showLinkModalAtom } from "~/app/[handle]/links/_components/link-modal";

export function RemarketingSettings() {
  const [endpoints] =
    api.analyticsEndpoint.byCurrentWorkspace.useSuspenseQuery();

  const setShowLinkModal = useSetAtom(showLinkModalAtom);

  // const { toast } = useToast();

  const context = api.useContext();
  const workspace = useWorkspace();

  const metaPixelForm = useZodForm({
    schema: insertMetaPixelSchema,
    values: {
      platform: "meta",
      workspaceId: workspace.id,
      id: endpoints.meta?.id ?? "",
      accessToken: endpoints.meta?.accessToken ?? "",
    },
  });

  const { mutateAsync: updateEndpoint } =
    api.analyticsEndpoint.update.useMutation({
      onSuccess: async () => {
        // toast({
        // 	variant: 'success',
        // 	description: 'Your Meta pixel has been updated.',
        // });
        await context.analyticsEndpoint.invalidate();
        metaPixelForm.reset();
      },
    });

  async function onSubmit(data: z.infer<typeof insertMetaPixelSchema>) {
    console.log("data => ", data);
    await updateEndpoint(data).catch((e) => console.error(e));
  }

  useEffectOnce(() => {
    console.log("closing link modal");
    setShowLinkModal(false);
  });

  return (
    <SettingsCard
      icon="meta"
      title="Meta Pixel"
      subtitle="Your Meta pixel information"
      form={metaPixelForm}
      onSubmit={onSubmit}
      disableSubmit={!metaPixelForm.formState.isDirty}
    >
      <TextField control={metaPixelForm.control} name="id" label="Pixel ID" />
      <TextAreaField
        name="accessToken"
        control={metaPixelForm.control}
        label="Pixel Access Token"
        className="break-words"
      />
    </SettingsCard>
  );
}
