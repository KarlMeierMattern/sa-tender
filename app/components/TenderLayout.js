"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

// Lazy load the components
const AdvertisedTenders = dynamic(() => import("./active/AdvertisedTenders"), {
  ssr: false,
});

const AwardedTenders = dynamic(() => import("./awarded/AwardedTenders"), {
  ssr: false,
});

export default function TenderLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page")) || 1;
  const currentTab = searchParams.get("tab") || "advertised";
  const currentView = searchParams.get("view") || "visualizations";
  const [selectedYear, setSelectedYear] = useState("all");

  const updateUrlParams = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`?${newParams.toString()}`);
  };

  return (
    <div>
      <Tabs
        defaultValue={currentTab}
        className="w-full"
        onValueChange={(value) => updateUrlParams({ tab: value })}
      >
        <TabsList className="mb-8">
          <TabsTrigger className="cursor-pointer" value="advertised">
            advertised
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="awarded">
            awarded
          </TabsTrigger>
        </TabsList>

        <TabsContent value="advertised">
          <AdvertisedTenders
            selectedYear={selectedYear}
            page={page}
            currentView={currentView}
            updateUrlParams={updateUrlParams}
          />
        </TabsContent>

        <TabsContent value="awarded">
          <AwardedTenders
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            page={page}
            currentView={currentView}
            updateUrlParams={updateUrlParams}
          />
        </TabsContent>
      </Tabs>
      <footer className="mt-24">
        <div className="fixed bottom-0 left-0 text-xs w-full bg-slate-700 text-white p-4 text-center opacity-90">
          <p>
            Built by{" "}
            <a
              className="underline text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.linkedin.com/in/karl-alexander-meier-mattern-ca-sa-16a3b919a/"
            >
              Karl-Alexander
            </a>{" "}
            with 💜
          </p>
          <p className="text-gray-500 italic pt-2">
            Data provided by{" "}
            <a
              href="https://www.etenders.gov.za/"
              className=" underline text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              eTenders.gov.za
            </a>
            , updated monthly
          </p>
        </div>
      </footer>
    </div>
  );
}
