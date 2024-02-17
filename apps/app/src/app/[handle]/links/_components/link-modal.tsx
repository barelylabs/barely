"use client";

import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@barely/hooks/use-debounce";
import { useDomains } from "@barely/hooks/use-domains";
import { useUser } from "@barely/hooks/use-user";
import { useWorkspace } from "@barely/hooks/use-workspace";
import { useZodForm } from "@barely/hooks/use-zod-form";
import { atomWithToggle } from "@barely/lib/atoms/atom-with-toggle";
import { api } from "@barely/server/api/react";
import { upsertLinkSchema } from "@barely/server/link.schema";
import { BlurImage } from "@barely/ui/elements/blur-image";
import { Button } from "@barely/ui/elements/button";
import { Icon } from "@barely/ui/elements/icon";
import { Label } from "@barely/ui/elements/label";
import { LoadingSpinner } from "@barely/ui/elements/loading";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@barely/ui/elements/modal";
import {
  InfoTooltip,
  SimpleTooltipContent,
  TooltipContent,
} from "@barely/ui/elements/tooltip";
import { Text } from "@barely/ui/elements/typography";
import { Form, SubmitButton } from "@barely/ui/forms";
import { SelectField } from "@barely/ui/forms/select-field";
import { SwitchField } from "@barely/ui/forms/switch-field";
import { TextField } from "@barely/ui/forms/text-field";
import {
  getAppAndAppRouteFromUrl,
  getUrlWithoutTrackingParams,
  isValidUrl,
} from "@barely/utils/link";
import { atom, useAtom, useSetAtom } from "jotai";

import type { Link, UpsertLink } from "@barely/server/link.schema";

import { LinksHotkeys } from "~/app/[handle]/links/_components/links-hotkeys";
import { SocialLinkPreviews } from "~/app/[handle]/links/_components/social-link-previews";
import { showUpgradeModalAtom } from "~/app/[handle]/settings/billing/upgrade-modal";

export const showLinkModalAtom = atomWithToggle(false);
export const editLinkAtom = atom<Link | null>(null);

export function LinkModal() {
  const apiContext = api.useContext();
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
  const setShowLinkModal = useSetAtom(showLinkModalAtom);

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

  // if editLink.url changes (i.e. we've selected it outside of the modal or it's been updated on the backend and propagated to the client),
  // we want to immediately update the debouncedUrl
  useEffect(() => {
    if (editLink?.url) {
      setDebouncedUrl(editLink.url);
    }
  }, [editLink?.url, setDebouncedUrl]);

  // transparent link
  // const appLinkData = getAppAndAppRouteFromUrl(debouncedUrl);
  const appLinkData = useMemo(() => {
    if (!workspace || !debouncedUrl) return null;

    return getAppAndAppRouteFromUrl(debouncedUrl, {
      workspace,
    });
  }, [workspace, debouncedUrl]);

  const transparentLink = appLinkData
    ? `${workspace.handle}.barely.link/${appLinkData.app}/${appLinkData.appRoute}`
    : null;

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

  const metaTags =
    linkForm.watch("customMetaTags") ??
    (!!editLink && !linkForm.formState.dirtyFields.url)
      ? {
          // image: linkForm.watch('image'),
          image: "",
          title: linkForm.watch("title"),
          description: linkForm.watch("description"),
        }
      : metaTagsFromUrl;

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

  /**
   * Handle submit
   * */
  const { mutateAsync: createLink } = api.link.create.useMutation({
    onSuccess: async () => {
      await apiContext.link.byWorkspace.invalidate();
      setShowLinkModal(false);
      setEditLink(null);
      linkForm.reset();
    },
  });

  const { mutateAsync: updateLink } = api.link.update.useMutation({
    onSuccess: async () => {
      await apiContext.link.byWorkspace.invalidate();
      setShowLinkModal(false);
      setEditLink(null);
      linkForm.reset();
    },
  });

  const LinkIconOrFavicon = useMemo(() => {
    if (!metaTagsFromUrl?.favicon) return null;

    return (
      <BlurImage
        src={metaTagsFromUrl.favicon}
        alt="Logo"
        className="mx-auto h-10 w-10"
        width={20}
        height={20}
      />
    );
  }, [metaTagsFromUrl?.favicon]);

  const onSubmit = async (data: z.infer<typeof upsertLinkSchema>) => {
    console.log("data => ", data);
    // await wait(1000);
    if (editLink)
      return await updateLink({
        ...data,
        id: editLink.id,
        ...(data.customMetaTags ? metaTags : {}),
      });
    return await createLink(data);
  };

  return (
    <>
      <LinksHotkeys form={linkForm} />

      <Modal
        showModalAtom={showLinkModalAtom}
        className="w-full"
        preventDefaultClose={linkForm.formState.isDirty}
      >
        <div className="grid w-full grid-cols-2 ">
          <div className="flex flex-col border-r-2 border-border ">
            <ModalHeader
              icon="link"
              iconOverride={LinkIconOrFavicon}
              title={
                editLink
                  ? `Edit ${editLink.domain}/${editLink.key}`
                  : "Create a new link"
              }
            />

            <Form form={linkForm} className="space-y-0" onSubmit={onSubmit}>
              <ModalBody>
                <div className="flex w-full max-w-full flex-col gap-8">
                  <div className="flex flex-col space-y-2">
                    <TextField
                      name="url"
                      label="Destination URL"
                      onPaste={(e) => {
                        const input = e.clipboardData.getData("text");
                        if (!input || !isValidUrl(input)) return;
                        e.preventDefault();
                        const cleanUrl = getUrlWithoutTrackingParams(input);
                        e.currentTarget.value = cleanUrl; // this wasn't triggering the formData to change
                        linkForm.setValue("url", cleanUrl);
                      }}
                    />
                    <AddWorkspaceSpotifyArtistId
                      spotifyArtistId={
                        appLinkData?.app === "spotify" &&
                        appLinkData.appRoute.startsWith("artist/")
                          ? appLinkData.appRoute.split("/")[1]
                          : ""
                      }
                    />

                    <div className="flex flex-col space-y-1">
                      <div className="flex flex-row justify-between">
                        <Label className="items-center">
                          <div className="flex flex-row items-center gap-2">
                            <p>Short Link</p>
                            {!linkDomains.length && (
                              <InfoTooltip
                                content={
                                  <TooltipContent
                                    title="Instead of brl.to, you can use your own branded domain for your short links."
                                    cta="Add a domain"
                                    href={`/${workspace.handle}/settings/domains`}
                                  />
                                }
                              />
                            )}
                          </div>
                        </Label>
                        <Label asChild>
                          <button
                            className="flex flex-row items-center gap-1 text-right"
                            onClick={() => randomizeKey()}
                            disabled={generatingKey}
                          >
                            {generatingKey ? (
                              <LoadingSpinner />
                            ) : (
                              <Icon.shuffle className="h-3 w-3" />
                            )}
                            <p>{generatingKey ? "Generating" : "Randomize"}</p>
                          </button>
                        </Label>
                      </div>

                      <div className="flex w-full flex-grow flex-row">
                        {loadingDomains ? (
                          "loading domains"
                        ) : (
                          <>
                            <SelectField
                              name="domain"
                              options={domainOptions}
                              className="w-fit flex-grow-0 rounded-r-none border-r-0"
                            />
                            <TextField
                              name="key"
                              className="flex-1 rounded-l-none"
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full max-w-full flex-col gap-1">
                      <Label>Transparent Link</Label>

                      <div className="h-fit min-h-[40px] w-full rounded-md border bg-slate-100 p-2">
                        <Text className="w-full break-all" variant="sm/normal">
                          {url.length < 4
                            ? ""
                            : transparentLink ??
                              "*We don't currently support that app"}
                        </Text>
                      </div>
                    </div>
                  </div>

                  <LinkOptionalSettings form={linkForm} />
                </div>
              </ModalBody>
              <ModalFooter>
                <SubmitButton fullWidth>
                  {editLink ? "Save changes" : "Create link"}
                </SubmitButton>
              </ModalFooter>
            </Form>
          </div>

          <SocialLinkPreviews
            form={linkForm}
            url={debouncedUrl}
            metaTags={metaTags}
            generatingMetaTags={generatingMetaTags}
          />
        </div>
      </Modal>
    </>
  );
}

interface LinkOptionalSettingsProps {
  form: UseFormReturn<UpsertLink>;
}

export function LinkOptionalSettings(props: LinkOptionalSettingsProps) {
  const { data: endpoints } =
    api.analyticsEndpoint.byCurrentWorkspace.useQuery();
  const setShowUpgradeModal = useSetAtom(showUpgradeModalAtom);
  const workspace = useWorkspace();

  const hasEndpoint = Object.values(endpoints ?? {}).some(
    (endpoint) => endpoint !== null,
  );

  return (
    <div>
      <div className="relative mb-2">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <div className="flex items-center space-x-2 bg-slate-50 px-3">
            <p className="text-sm text-gray-400">Optional</p>
          </div>
        </div>
      </div>

      <SwitchField
        name="remarketing"
        label="Remarketing"
        infoTooltip={
          <SimpleTooltipContent
            title="Add analytics and remarketing pixels to your links."
            cta="Learn more"
            href={`/${workspace.handle}/settings/links`}
          />
        }
        control={props.form.control}
        disabled={!hasEndpoint}
        disabledTooltip={
          workspace.plan === "free" ? (
            <TooltipContent
              title="Upgrade to Pro to enable remarketing."
              cta="Upgrade to Pro"
              onClick={() => setShowUpgradeModal(true)}
              closeOnClick
            />
          ) : (
            <TooltipContent
              title={`Add at least one pixel for ${workspace.handle} to enable remarketing.`}
              cta="Add a pixel"
              href={`/${workspace.handle}/settings/remarketing`}
              // onClick={() => {
              // 	wait(1000)
              // 		.then(() => {
              // 			setShowLinkModalAtom(false);
              // 		})
              // 		.catch(e => console.error(e));
              // }}
            />
          )
        }
      />

      {/* <Tooltip>
				<TooltipTrigger asChild>
					<SwitchField
						name='remarketing'
						label='Remarketing'
						control={props.form.control}
						disabled={!hasEndpoint}
					/>
				</TooltipTrigger>
				<TooltipContent className='flex max-w-[200px] flex-col gap-3 text-center'>
					<p>You need to add at least one pixel before enabling remarketing.</p>
					<Button fullWidth size='sm' href={`/login`}>
						Add an endpoint
					</Button>
				</TooltipContent>
			</Tooltip> */}

      {/* <pre>{JSON.stringify(endpoints, null, 2)}</pre> */}
    </div>
  );
}

export function AddWorkspaceSpotifyArtistId(props: {
  spotifyArtistId?: string;
}) {
  const [show, setShow] = useState(true);
  const apiUtils = api.useContext();
  const workspace = useWorkspace();
  const { mutateAsync: updateWorkspace } = api.workspace.update.useMutation();

  const onSubmit = async () => {
    await updateWorkspace({
      spotifyArtistId: props.spotifyArtistId,
    });
    await apiUtils.workspace.invalidate();
  };

  if (
    !show ||
    !props.spotifyArtistId ||
    (workspace.spotifyArtistId?.length ?? 0) > 0
  )
    return null;

  return (
    <div className="flex flex-row items-center justify-between gap-2 py-2">
      <Text variant="sm/normal">
        👆 Is that the link to{" "}
        <span className="font-bold">{workspace.name}`&apos;`s</span> Spotify
        Artist Profile?
      </Text>
      <div className="flex flex-row gap-2">
        <Button variant="primary" size="sm" onClick={onSubmit}>
          yes
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setShow(false)}>
          no
        </Button>
      </div>
    </div>
  );
}
