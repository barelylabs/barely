"use client";

import { use } from "react";
import { api } from "@barely/server/api/react";
import { NoResultsPlaceholder } from "@barely/ui/components/no-results-placeholder";

import type { EdgeRouterOutputs } from "@barely/lib/server/api/router.edge";
import type { LinkFilterParams } from "@barely/server/link.schema";

import { LinkCard } from "~/app/[handle]/links/_components/link-card";
import { NewLinkButton } from "~/app/[handle]/links/_components/new-link-button";

export function AllLinks(props: {
  links: Promise<EdgeRouterOutputs["link"]["byWorkspace"]>;
  filters: LinkFilterParams;
}) {
  const initialData = use(props.links);

  const { data: links } = api.link.byWorkspace.useQuery(props.filters, {
    initialData,
  });

  if (!links?.length)
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
