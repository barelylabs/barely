"use client";

import { useCallback, useMemo } from "react";
import { api } from "@barely/server/api/react";
import { AreaChart } from "@barely/ui/charts/area-chart";
import { Badge } from "@barely/ui/elements/badge";
import { Card } from "@barely/ui/elements/card";
import { Icon } from "@barely/ui/elements/icon";
import { H, Text } from "@barely/ui/elements/typography";
import { nFormatter } from "@barely/utils/number";
import { capitalize } from "@barely/utils/text";

import { useWebEventStatFilters } from "~/app/[handle]/links/stats/use-stat-filters";

export function LinkTimeseries() {
  const { filters, removeFilter } = useWebEventStatFilters();

  const formatTimestamp = useCallback(
    (d: Date) => {
      switch (filters.dateRange) {
        // case '1h':
        // 	return new Date(d).toLocaleDateString('en-us', {
        // 		hour: 'numeric',
        // 		minute: 'numeric',
        // 	});
        case "1d":
          return new Date(d).toLocaleDateString("en-us", {
            month: "short",
            day: "numeric",
            hour: "numeric",
          });
        default:
          return new Date(d).toLocaleDateString("en-us", {
            month: "short",
            day: "numeric",
          });
      }
    },
    [filters.dateRange],
  );

  const [timeseries] = api.stat.linkTimeseries.useSuspenseQuery(
    { ...filters },
    {
      select: (data) =>
        data.map((row) => ({
          ...row,
          date: formatTimestamp(row.date),
        })),
    },
  );

  const totalClicks = timeseries.reduce((acc, row) => acc + row.clicks, 0);

  const filterBadges = useMemo(() => {
    return Object.entries(filters)
      .filter(
        ([key, value]) =>
          value !== undefined && key !== "assetId" && key !== "dateRange",
      )
      .map(([key, value]) => {
        const filterKey = key as keyof typeof filters;
        return (
          <Badge
            key={filterKey}
            className="mr-2"
            variant="muted"
            onRemove={() => removeFilter(filterKey)}
            removeButton
            rectangle
          >
            {filterKey === "os" ? "OS" : capitalize(filterKey)}
            <span className="ml-2 font-bold">{value.toString()}</span>
          </Badge>
        );
      });
  }, [filters, removeFilter]);

  return (
    <Card className="p-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-end gap-1">
            <H size="1">{totalClicks}</H>
            <Icon.stat className="mb-0.5 h-7 w-7" />
          </div>
          <Text variant="sm/medium" className="uppercase">
            TOTAL CLICKS
          </Text>
        </div>
        <div className="flex flex-row justify-between gap-2">
          {filterBadges}
        </div>
      </div>
      <AreaChart
        className="mt-4 h-72 "
        data={timeseries}
        index="date"
        categories={["clicks"]}
        colors={["indigo"]}
        showXAxis={true}
        showLegend={false}
        curveType="linear"
        yAxisWidth={30}
        valueFormatter={(v) => nFormatter(v)}
      />
    </Card>
  );
}
