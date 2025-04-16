"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";

// Lazy load the components
const AdvertisedTenders = dynamic(() => import("./AdvertisedTenders"), {
  ssr: false,
});

const AwardedTenders = dynamic(() => import("./AwardedTenders"), {
  ssr: false,
});

export default function TenderLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page")) || 1;
  const currentView = searchParams.get("view") || "visualizations";
  const currentTab = searchParams.get("tab") || "advertised";

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
    <div className="p-4">
      <Tabs
        defaultValue={currentTab}
        className="w-full"
        onValueChange={(value) => updateUrlParams({ tab: value })}
      >
        <TabsList className="mb-8">
          <TabsTrigger value="advertised">advertised</TabsTrigger>
          <TabsTrigger value="awarded">awarded</TabsTrigger>
        </TabsList>

        <TabsContent value="advertised">
          <AdvertisedTenders
            page={page}
            currentView={currentView}
            updateUrlParams={updateUrlParams}
          />
        </TabsContent>

        <TabsContent value="awarded">
          <AwardedTenders
            page={page}
            currentView={currentView}
            updateUrlParams={updateUrlParams}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
