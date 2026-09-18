"use client";

import { BarChart3, Table2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

export default function TenderToolbar({
  currentTab,
  currentView,
  updateUrlParams,
  onAwardedHover,
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const showViewToggle = currentTab === "advertised" && isDesktop;

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <TabsList>
        <TabsTrigger className="cursor-pointer px-4" value="advertised">
          Advertised
        </TabsTrigger>
        <TabsTrigger
          className="cursor-pointer px-4"
          value="awarded"
          onMouseEnter={onAwardedHover}
          onFocus={onAwardedHover}
        >
          Awarded
        </TabsTrigger>
      </TabsList>

      {showViewToggle && (
        <Tabs
          value={currentView}
          onValueChange={(value) => updateUrlParams({ view: value })}
        >
          <TabsList>
            <TabsTrigger
              className="cursor-pointer gap-1.5 px-3"
              value="visualizations"
            >
              <BarChart3 className="size-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer gap-1.5 px-3" value="table">
              <Table2 className="size-4" />
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </div>
  );
}
