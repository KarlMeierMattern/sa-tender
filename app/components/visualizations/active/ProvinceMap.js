"use client";

import ProvinceTenderMap from "../shared/ProvinceTenderMap";

export default function ProvinceMap({ data }) {
  return (
    <ProvinceTenderMap
      title="Tenders by Province"
      subtitle="Hover or tap a province for details"
      data={data}
      mode="count"
    />
  );
}
