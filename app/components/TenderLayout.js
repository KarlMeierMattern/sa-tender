"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchAwardedData } from "@/app/hooks/active/usePrefetchAwardedData";
import TenderToolbar from "./TenderToolbar";

const ActiveTenders = dynamic(() => import("./active/ActiveTenders"), {
  ssr: false,
});

const AwardedTenders = dynamic(() => import("./awarded/AwardedTenders"), {
  ssr: false,
});

export default function TenderLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const page = parseInt(searchParams.get("page")) || 1;
  const currentTab = searchParams.get("tab") || "advertised";
  const currentView = searchParams.get("view") || "visualizations";
  const [selectedYear, setSelectedYear] = useState("all");

  const updateUrlParams = useCallback(
    (params) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      router.push(`?${newParams.toString()}`);
    },
    [searchParams, router]
  );

  const handleAwardedTabHover = () => {
    prefetchAwardedData(queryClient, selectedYear).catch(() => {});
  };

  return (
    <div>
      <Tabs
        value={currentTab}
        className="w-full"
        onValueChange={(value) => updateUrlParams({ tab: value })}
      >
        <TenderToolbar
          currentTab={currentTab}
          currentView={currentView}
          updateUrlParams={updateUrlParams}
          onAwardedHover={handleAwardedTabHover}
        />

        <TabsContent value="advertised">
          {currentTab === "advertised" && (
            <ActiveTenders
              page={page}
              currentView={currentView}
              updateUrlParams={updateUrlParams}
            />
          )}
        </TabsContent>

        <TabsContent value="awarded">
          {currentTab === "awarded" && (
            <AwardedTenders
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              page={page}
              currentView={currentView}
              updateUrlParams={updateUrlParams}
            />
          )}
        </TabsContent>
      </Tabs>
      <footer className="mt-16 border-t py-6 text-center text-xs text-muted-foreground">
        <p>
          Data from{" "}
          <a
            href="https://www.etenders.gov.za/"
            className="hover:text-foreground hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            eTenders
          </a>
          , updated monthly · Built by{" "}
          <a
            href="https://www.linkedin.com/in/karl-alexander-meier-mattern-ca-sa-16a3b919a/"
            className="hover:text-foreground hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Karl-Alexander
          </a>
        </p>
      </footer>
    </div>
  );
}
