"use client";

import { api } from "@barely/server/api/react";
import { NoResultsPlaceholder } from "@barely/ui/components/no-results-placeholder";

import type { LinkFilterParams } from "@barely/server/link.schema";

import { LinkCard } from "~/app/[handle]/links/_components/link-card";
import { NewLinkButton } from "~/app/[handle]/links/_components/new-link-button";

export function AllLinks(filters: LinkFilterParams) {
  const [links] = api.link.byWorkspace.useSuspenseQuery(filters);

  if (!links.length)
    return (
      <NoResultsPlaceholder
        icon="link"
        title="No links found."
        subtitle="Create a new link to get started"
        button={<NewLinkButton />}
      />
    );

  return (
    <>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <LinkCard link={l} key={l.id} />
        ))}
      </ul>
    </>
  );
}
