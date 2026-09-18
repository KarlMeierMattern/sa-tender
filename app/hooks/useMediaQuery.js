"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const handler = (event) => setMatches(event.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
