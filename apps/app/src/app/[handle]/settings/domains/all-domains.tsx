"use client";

import { api } from "@barely/server/api/react";
import { NoResultsPlaceholder } from "@barely/ui/components/no-results-placeholder";

import { AddDomainButton } from "~/app/[handle]/settings/domains/add-domain-button";
import { DomainCard } from "~/app/[handle]/settings/domains/domain-card";

export function AllDomains() {
  const [domains] = api.domain.byWorkspace.useSuspenseQuery();

  if (!domains.length)
    return (
      <NoResultsPlaceholder
        icon="domain"
        title="No domains found."
        subtitle="Add a new domain to get started."
        button={<AddDomainButton />}
      />
    );

  return (
    <ul className="grid grid-cols-1 gap-3">
      {domains.map((domain, index) => (
        <li key={domain.domain}>
          <DomainCard key={index} domain={domain} />
        </li>
      ))}
    </ul>
  );
}
