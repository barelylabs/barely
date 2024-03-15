"use client";

import { useRef } from "react";
import { Button } from "@barely/ui/elements/button";
import { Icon } from "@barely/ui/elements/icon";
import { Input } from "@barely/ui/elements/input";
import { Label } from "@barely/ui/elements/label";
import { Switch } from "@barely/ui/elements/switch";
import { Text } from "@barely/ui/elements/typography";

import { useLinkContext } from "~/app/[handle]/links/_components/link-context";

export function LinkFilters() {
  const { filters, setSearch, toggleArchived, clearAllFilters } =
    useLinkContext();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const showClearButton = filters.search ?? filters.showArchived;

  return (
    <div className="flex h-fit w-fit flex-col gap-4 rounded-md border p-6 py-6">
      <div className="flex flex-col gap-3">
        <div className="flex h-6 flex-row items-end justify-between">
          <Text className="text-left" variant="lg/semibold">
            Filters
          </Text>
          {showClearButton ? (
            <Button
              look="outline"
              size="sm"
              onClick={() => {
                if (searchInputRef.current) {
                  searchInputRef.current.value = "";
                }
                clearAllFilters();
              }}
            >
              <Icon.x className="mr-1 h-3 w-3" />
              Clear
            </Button>
          ) : null}
        </div>

        <Input
          id="searchInput"
          defaultValue={filters.search ?? ""}
          ref={searchInputRef}
          // onChange={(e) => setSearch(e.target.value)}
          onChangeDebounced={(e) => setSearch(e.target.value)}
          debounce={500}
          placeholder="Search..."
        />
      </div>

      <div className="flex flex-row items-center justify-between gap-4">
        <Label htmlFor="showArchivedSwitch">Include archived links</Label>
        <Switch
          id="showArchivedSwitch"
          checked={!!filters.showArchived}
          onClick={() => toggleArchived()}
          // data.showArchived
          //   ? removeByKey("showArchived")
          //   : setQuery("showArchived", true)

          size="sm"
        />
      </div>
    </div>
  );
}
