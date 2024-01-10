"use client";

import { useState } from "react";
import { api } from "@barely/server/api/react";
import { BarList } from "@barely/ui/charts/bar-list";
import { Card } from "@barely/ui/elements/card";
import { TabButtons } from "@barely/ui/elements/tab-buttons";
import { H } from "@barely/ui/elements/typography";
import { COUNTRIES } from "@barely/utils/constants";

import type { BarListBarProps } from "@barely/ui/charts/bar-list";

import { useWebEventStatFilters } from "~/app/[handle]/links/stats/use-stat-filters";

export function LinkLocations() {
  const [tab, setTab] = useState<"Country" | "City">("Country");

  const { filters, getSetFilterPath } = useWebEventStatFilters();

  const [countries] = api.stat.topCountries.useSuspenseQuery(filters);

  const { data: cities } = api.stat.topCities.useQuery(filters);

  const locationData =
    tab === "Country" ? countries.map((c) => ({ ...c, city: "" })) : cities;

  const plotData: BarListBarProps[] = !locationData
    ? []
    : locationData?.map((c) => ({
        name: tab === "Country" ? COUNTRIES[c.country] ?? c.country : c.city,
        value: c.sessions,
        icon: () => (
          <picture className="mr-2 flex items-center ">
            <img
              alt={c.country}
              src={`https://flag.vercel.app/m/${c.country}.svg`}
              className="h-3 w-5"
            />
          </picture>
        ),
        href:
          tab === "Country"
            ? getSetFilterPath("country", c.country)
            : getSetFilterPath("city", c.city),
        target: "_self",
      }));

  const barList = (limit?: number) => {
    return (
      <BarList
        color="amber"
        data={limit ? plotData.slice(0, limit) : plotData}
      />
    );
  };

  return (
    <Card className="h-[400px]">
      <div className="flex flex-row items-center justify-between">
        <H size="4">Locations</H>
        <TabButtons
          tabs={[
            { label: "Country", value: "Country" },
            { label: "City", value: "City" },
          ]}
          selectedTab={tab}
          setSelectedTab={setTab}
        />
      </div>
      {barList(7)}
    </Card>
  );
}
