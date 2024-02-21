"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@barely/hooks/use-workspace";
import { atomWithToggle } from "@barely/lib/atoms/atom-with-toggle";
import { api } from "@barely/server/api/react";
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
import { InfoTooltip, TooltipContent } from "@barely/ui/elements/tooltip";
import { Text } from "@barely/ui/elements/typography";
import { Form, SubmitButton } from "@barely/ui/forms";
import { SelectField } from "@barely/ui/forms/select-field";
import { TextField } from "@barely/ui/forms/text-field";
import { getUrlWithoutTrackingParams, isValidUrl } from "@barely/utils/link";
import { atom } from "jotai";

import type { Link } from "@barely/server/link.schema";

import { LinkOptionalSettings } from "~/app/[handle]/links/_components/link-optional-settings";
import { LinksHotkeys } from "~/app/[handle]/links/_components/links-hotkeys";
import { SocialLinkPreviews } from "~/app/[handle]/links/_components/social-link-previews";
import { useLinkModal } from "~/app/[handle]/links/_components/use-link-modal";

export const showLinkModalAtom = atomWithToggle(false);
export const editLinkAtom = atom<Link | null>(null);

export function LinkModal() {
  const workspace = useWorkspace();
  const {
    linkForm,
    metaTags,
    generatingMetaTags,
    linkDomains,
    loadingDomains,
    domainOptions,
    editLink,
    handleSubmit,
    transparentLinkData,
    randomizeKey,
    generatingKey,
    debouncedUrl,
    closeModal,
  } = useLinkModal();

  const LinkIconOrFavicon = useMemo(() => {
    if (!metaTags?.favicon) return null;

    return (
      <BlurImage
        src={metaTags.favicon}
        alt="Logo"
        className="mx-auto h-10 w-10"
        width={20}
        height={20}
      />
    );
  }, [metaTags?.favicon]);

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

            <Form form={linkForm} className="space-y-0" onSubmit={handleSubmit}>
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
                        linkForm.setValue("url", cleanUrl);
                      }}
                      disabled={!!editLink?.transparent}
                    />

                    <AddWorkspaceSpotifyArtistId
                      spotifyArtistId={
                        transparentLinkData?.app === "spotify" &&
                        transparentLinkData.appRoute?.startsWith("artist/")
                          ? transparentLinkData.appRoute.split("/")[1]
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
                        {!editLink && (
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
                              <p>
                                {generatingKey ? "Generating" : "Randomize"}
                              </p>
                            </button>
                          </Label>
                        )}
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
                              disabled={!!editLink?.key}
                            />
                            <TextField
                              name="key"
                              className="flex-1 rounded-l-none"
                              disabled={!!editLink?.key}
                            />
                          </>
                        )}
                      </div>
                    </div>
                    {editLink?.transparent && (
                      <div className="flex flex-col gap-1">
                        <Label>Transparent Link</Label>
                        <TransparentLinkDisplay
                          transparentLink={transparentLinkData?.transparentLink}
                        />
                      </div>
                    )}
                  </div>

                  <LinkOptionalSettings
                    linkForm={linkForm}
                    editLink={editLink}
                    transparentLinkData={transparentLinkData}
                  />
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
            url={debouncedUrl}
            metaTags={metaTags}
            generatingMetaTags={generatingMetaTags}
            closeModal={closeModal}
          />
        </div>
      </Modal>
    </>
  );
}

export function TransparentLinkDisplay({
  transparentLink,
}: {
  transparentLink?: string;
}) {
  if (!transparentLink) return null;

  return (
    <div className="flex w-full max-w-full flex-col gap-1">
      <div className="flex h-fit min-h-[40px] w-full flex-row items-center gap-2 rounded-md border bg-slate-100 p-2">
        <Icon.ghost className="h-4 w-4 text-muted-foreground" />
        <Text className="w-full break-all" variant="sm/normal">
          {transparentLink}
        </Text>
      </div>
    </div>
  );
}

export function AddWorkspaceSpotifyArtistId(props: {
  spotifyArtistId?: string;
}) {
  const [show, setShow] = useState(true);
  const apiUtils = api.useUtils();
  const workspace = useWorkspace();
  const { mutateAsync: updateWorkspace } = api.workspace.update.useMutation();

  const { data: spotifyArtistIdTaken } =
    api.workspace.spotifyArtistIdTaken.useQuery(props.spotifyArtistId ?? "", {
      enabled: !!props.spotifyArtistId,
    });

  const handleSubmit = async () => {
    await updateWorkspace({
      spotifyArtistId: props.spotifyArtistId,
    });
    await apiUtils.workspace.invalidate();
  };

  if (
    !show ||
    spotifyArtistIdTaken === undefined ||
    spotifyArtistIdTaken === true ||
    !props.spotifyArtistId ||
    (workspace.spotifyArtistId?.length ?? 0) > 0
  )
    return null;

  return (
    <div className="flex flex-row items-center justify-between gap-2 py-2">
      <Text variant="sm/normal">
        👆 Is that the link to{" "}
        <span className="font-bold">{workspace.name}</span>&apos;s Spotify
        Artist Profile?
      </Text>
      <div className="flex flex-row gap-2">
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          yes
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setShow(false)}>
          no
        </Button>
      </div>
    </div>
  );
}
