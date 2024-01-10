"use client";

import { useCallback, useState } from "react";
import { useWorkspace } from "@barely/hooks/use-workspace";
import { useWorkspaceUpdateForm } from "@barely/hooks/use-workspace-update-form";
import { useZodForm } from "@barely/hooks/use-zod-form";
import { api } from "@barely/server/api/react";
import { SettingsCard } from "@barely/ui/components/settings-card";
import { BlurImage } from "@barely/ui/elements/blur-image";
import { Icon } from "@barely/ui/elements/icon";
import { Text } from "@barely/ui/elements/typography";
import { SelectField } from "@barely/ui/forms/select-field";
import { TextField } from "@barely/ui/forms/text-field";
import { z } from "zod";

import type { workspaceTypeSchema } from "@barely/server/workspace.schema";
import type { SelectFieldOption } from "@barely/ui/forms/select-field";

// import { toast } from '@barely/ui/hooks/use-toast';

export function DisplayOrWorkspaceNameForm() {
  const { form, onSubmit, isPersonal } = useWorkspaceUpdateForm();

  return (
    <SettingsCard
      form={form}
      onSubmit={onSubmit}
      title={isPersonal ? "Your Name" : "Workspace Name"}
      subtitle={
        isPersonal
          ? "Please enter your full name, or a display name you are comfortable with. This is how your name will appear to others on the platform."
          : `This is your workspace's visible name within Barely. For example, the name of your band, solo project, or company.`
      }
      disableSubmit={!form.formState.isDirty}
      formHint="Please use a maximum of 32 characters"
    >
      <TextField label="" control={form.control} name="name" />
    </SettingsCard>
  );
}

export function HandleForm() {
  const { form, onSubmit, isPersonal } = useWorkspaceUpdateForm();

  return (
    <SettingsCard
      form={form}
      onSubmit={onSubmit}
      title={isPersonal ? "Your Handle" : "Workspace Handle"}
      subtitle={
        isPersonal
          ? "Please enter a personal handle that you are comfortable with. This is how your name will appear to others on the platform."
          : `This is your workspace's unique handle on Barely. It'll be used for your public links and bio.`
      }
      disableSubmit={!form.formState.isDirty}
      formHint="Only lowercase letters, numbers, and underscores are allowed."
    >
      <TextField label="" control={form.control} name="handle" />

      {!isPersonal && (
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-2 text-muted-foreground">
            <Icon.bio className="h-3 w-3" />
            <Text variant="sm/normal" muted>
              {form.watch("handle")}.barely.bio
            </Text>
          </div>
          <div className="flex flex-row items-center gap-2 text-muted-foreground">
            <Icon.newspaper className="h-3 w-3" />
            <Text variant="sm/normal" muted>
              {form.watch("handle")}.barely.press
            </Text>
          </div>
          <div className="flex flex-row items-center gap-2 text-muted-foreground">
            <Icon.link className="h-3 w-3" />
            <Text variant="sm/normal" muted>
              {form.watch("handle")}.barely.link/transparent-link
            </Text>
          </div>
        </div>
      )}
    </SettingsCard>
  );
}

export function AvatarForm() {
  const workspace = useWorkspace();
  const isPersonal = workspace.type === "personal";
  const apiContext = api.useContext();

  const avatarUploadSchema = z.object({ image: z.string() });

  const form = useZodForm({
    schema: avatarUploadSchema,
    values: {
      image: workspace.imageUrl ?? "",
    },
    resetOptions: {
      keepDirtyValues: true, // retain user-interacted input
    },
  });

  const [dragActive, setDragActive] = useState(false);

  const onChangeImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
        if (file.size / 1024 / 1024 > 2) {
          // toast({ //fixme
          // 	title: 'File size too big (max 2MB)',
          // 	variant: 'destructive',
          // 	duration: 5000,
          // });
        } else if (file.type !== "image/png" && file.type !== "image/jpeg") {
          // toast({ //fixme
          // 	title: 'File type not supported (.png or .jpg only)',
          // 	variant: 'destructive',
          // 	duration: 5000,
          // });
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            form.setValue("image", e.target?.result as string, {
              shouldDirty: true,
            });
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [form],
  );

  // const [uploading, setUploading] = useState(false);

  // form

  const { mutateAsync: uploadAvatar } =
    api.node.workspace.uploadAvatar.useMutation({
      onSettled: async () => {
        await apiContext.workspace.current.invalidate();
        form.reset();
      },
    });

  const onSubmit = async (data: z.infer<typeof avatarUploadSchema>) => {
    await uploadAvatar(data.image);
  };

  const image = form.watch("image");

  return (
    <SettingsCard
      form={form}
      onSubmit={onSubmit}
      title={isPersonal ? "Your Avatar" : "Workspace Avatar"}
      subtitle={
        isPersonal
          ? "This is your personal avatar on Barely."
          : `This is your workspace's avatar on Barely.`
      }
      disableSubmit={!form.formState.isDirty}
    >
      <label
        htmlFor="image"
        className="group relative mt-1 flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"
      >
        <div
          className="absolute z-[5] h-full w-full rounded-full"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              if (file.size / 1024 / 1024 > 2) {
                // toast({//fixme
                // 	title: 'File size too big (max 2MB)',
                // 	variant: 'destructive',
                // 	duration: 5000,
                // });
              } else if (
                file.type !== "image/png" &&
                file.type !== "image/jpeg"
              ) {
                // toast({//fixme
                // 	title: 'File type not supported (.png or .jpg only)',
                // 	variant: 'destructive',
                // 	duration: 5000,
                // });
              } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                  // setImage(e.target?.result as string);
                  form.setValue("image", e.target?.result as string, {
                    shouldDirty: true,
                  });
                };
                reader.readAsDataURL(file);
              }
            }
          }}
        />

        <div
          className={`${
            dragActive
              ? "cursor-copy border-2 border-black bg-gray-50 opacity-100"
              : ""
          } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-full bg-white transition-all ${
            image
              ? "opacity-0 group-hover:opacity-100"
              : "group-hover:bg-gray-50"
          }`}
        >
          <Icon.upload
            className={`${
              dragActive ? "scale-110" : "scale-100"
            } h-5 w-5 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
          />
        </div>
        {image && (
          <BlurImage
            src={image}
            alt="Preview"
            className="h-full w-full rounded-full object-cover"
            fill
          />
        )}
      </label>

      <div className="mt-1 flex rounded-full shadow-sm">
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onChangeImage}
        />
      </div>
    </SettingsCard>
  );
}

export function WorkspaceTypeForm() {
  const { form, onSubmit, isPersonal } = useWorkspaceUpdateForm();

  if (isPersonal) {
    return null;
  }

  const workspaceTypeOptions: SelectFieldOption<
    z.infer<typeof workspaceTypeSchema>
  >[] = [
    { value: "creator", label: "Creator" },
    { value: "solo_artist", label: "Solo Artist" },
    { value: "band", label: "Band" },
    { value: "product", label: "Product" },
  ];

  return (
    <SettingsCard
      form={form}
      onSubmit={onSubmit}
      title="Workspace Type"
      subtitle="This is your workspace type on Barely."
      disableSubmit={!form.formState.isDirty}
    >
      <SelectField
        label=""
        control={form.control}
        name="type"
        options={workspaceTypeOptions}
      />
    </SettingsCard>
  );
}
