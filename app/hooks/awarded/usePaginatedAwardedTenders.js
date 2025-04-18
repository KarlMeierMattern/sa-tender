"use client";

import { useQuery } from "@tanstack/react-query";

export function usePaginatedAwardedTenders({
  page = 1,
  limit = 10,
  category = "",
  department = "",
  province = "",
  advertised = "",
  awarded = "",
} = {}) {
  return useQuery({
    queryKey: [
      "awarded-tenders-table",
      page,
      category,
      department,
      province,
      advertised,
      awarded,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filter parameters if they exist
      if (category) params.append("category", category);
      if (department) params.append("department", department);
      if (province) params.append("province", province);
      if (advertised) params.append("advertised", advertised);
      if (awarded) params.append("awarded", awarded);

      const res = await fetch(
        `/api/tenders-detail-awarded?${params.toString()}`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}
