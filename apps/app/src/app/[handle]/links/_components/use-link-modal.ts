"use client";

import type { z } from "zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@barely/lib/hooks/use-debounce";
import { useDomains } from "@barely/lib/hooks/use-domains";
import { useUser } from "@barely/lib/hooks/use-user";
import { useWorkspace } from "@barely/lib/hooks/use-workspace";
import { useZodForm } from "@barely/lib/hooks/use-zod-form";
import { api } from "@barely/lib/server/api/react";
import { upsertLinkSchema } from "@barely/lib/server/link.schema";
import {
  getTransparentLinkDataFromUrl,
  isValidUrl,
} from "@barely/lib/utils/link";
import { useAtom } from "jotai";

import {
  editLinkAtom,
  showLinkModalAtom,
} from "~/app/[handle]/links/_components/link-modal";

export function useLinkModal() {
  const apiUtils = api.useUtils();
  const workspace = useWorkspace();
  const user = useUser();

  const {
    linkDomains,
    primaryLinkDomain,
    isLoading: loadingDomains,
  } = useDomains();

  const domainOptions = linkDomains.map((domain) => ({
    value: domain.domain,
    label: domain.domain,
  }));

  const [editLink, setEditLink] = useAtom(editLinkAtom);
  const [, setShowLinkModal] = useAtom(showLinkModalAtom);

  /**
   * if editLink exists, we're editing an existing link
   */
  const linkForm = useZodForm({
    schema: upsertLinkSchema,
    values: editLink ?? {
      userId: user.id,
      workspaceId: workspace.id,

      // transparent link
      handle: workspace.handle,
      transparent: false,

      // short link
      domain: primaryLinkDomain.domain,
      key: "",

      //destination
      url: "",
      appleScheme: "",
      androidScheme: "",

      // meta tags
      customMetaTags: false,
      title: "",
      description: "",
      image: "",
    },

    resetOptions: {
      keepDirtyValues: true, // retain user-interacted input
    },
  });

  /**
   *  Link state derived from url (app/appRoute, metaTags)
   *  This data is stored outside the form, but used in onSubmit
   * */
  const url = linkForm.watch("url");
  const [debouncedUrl, setDebouncedUrl, urlIsDebounced] = useDebounce(url);

  /**
   * if editLink.url changes (i.e. we've selected it outside of the modal or it's been updated on the backend and propagated to the client),
   * we want to immediately update the debouncedUrl
   * */

  useEffect(() => {
    if (editLink?.url) {
      setDebouncedUrl(editLink.url);
    }
  }, [editLink?.url, setDebouncedUrl]);

  // transparent link
  const transparentLinkData = useMemo(() => {
    if (!workspace || !debouncedUrl) return null;

    return getTransparentLinkDataFromUrl(debouncedUrl, workspace);
  }, [workspace, debouncedUrl]);

  // meta tags
  const { data: metaTagsFromUrl, isFetching: isFetchingMetaTags } =
    api.link.getMetaTags.useQuery(debouncedUrl, {
      enabled: isValidUrl(debouncedUrl),
      refetchOnWindowFocus: false,
    });

  // we are generating meta tags if:
  // - there is no editLink && isFetchingMetaTags
  // - there is an editLink && url is dirty && isFetchingMetaTags
  const generatingMetaTags =
    (!editLink && isFetchingMetaTags) ??
    (!editLink && !urlIsDebounced) ??
    (!!editLink && linkForm.formState.dirtyFields.url && isFetchingMetaTags) ??
    false;

  const metaTags = useMemo(() => {
    return linkForm.watch("customMetaTags") ??
      (!!editLink && !linkForm.formState.dirtyFields.url)
      ? {
          image: "",
          title: linkForm.watch("title"),
          description: linkForm.watch("description"),
        }
      : metaTagsFromUrl;
  }, [linkForm, editLink, metaTagsFromUrl]);

  /**
   * Generate random key
   * */
  const [generatingKey, setGeneratingKey] = useState(false);
  const { mutateAsync: generateRandomKey } =
    api.link.generateRandomKey.useMutation();

  const randomizeKey = useCallback(async () => {
    setGeneratingKey(true);
    const key = await generateRandomKey({
      domain: linkForm.watch("domain"),
    });

    linkForm.setValue("key", key, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setGeneratingKey(false);
  }, [generateRandomKey, linkForm]);

  /** Close the modal */
  const closeModal = useCallback(async () => {
    setShowLinkModal(false);
    setEditLink(null);
    setDebouncedUrl("");
    linkForm.reset();
    await apiUtils.link.byWorkspace.invalidate();
  }, [
    apiUtils.link.byWorkspace,
    setShowLinkModal,
    setEditLink,
    setDebouncedUrl,
    linkForm,
  ]);

  /**
   * Handle submit
   * */
  const { mutateAsync: createLink } = api.link.create.useMutation({
    onSuccess: async () => {
      await closeModal();
    },
  });

  const { mutateAsync: updateLink } = api.link.update.useMutation({
    onSuccess: async () => {
      await closeModal();
    },
  });

  const handleSubmit = async (data: z.infer<typeof upsertLinkSchema>) => {
    console.log("data => ", data);
    if (editLink)
      return await updateLink({
        ...data,
        id: editLink.id,
        ...(data.customMetaTags ? metaTags : {}),
      });
    return await createLink(data);
  };

  return {
    linkForm,
    linkDomains,
    loadingDomains,
    domainOptions,
    transparentLinkData,
    metaTags,
    generatingMetaTags,
    generatingKey,
    randomizeKey,
    handleSubmit,
    editLink,
    setEditLink,
    debouncedUrl,
    setDebouncedUrl,
    closeModal,
    setShowLinkModal,
  };
}
