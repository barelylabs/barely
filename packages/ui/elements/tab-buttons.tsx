"use client";

import type { Dispatch, SetStateAction } from "react";
import React from "react";

import { Button } from "./button";

interface Tab<T> {
  label: string;
  value: T;
}

interface ControlledTabsProps<T> {
  tabs: Tab<T>[];
  selectedTab: string;
  setSelectedTab: Dispatch<SetStateAction<T>>;
}

export const TabButtons = <T,>({
  tabs,
  selectedTab,
  setSelectedTab,
}: ControlledTabsProps<T>) => (
  <div className="flex flex-row items-center gap-2">
    {tabs.map((tab) => (
      <Button
        key={tab.label}
        look="tab"
        size="sm"
        selected={selectedTab === tab.value}
        onClick={() => setSelectedTab(tab.value)}
      >
        {tab.label}
      </Button>
    ))}
  </div>
);
