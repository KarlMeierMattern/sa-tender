export const PROVINCE_TILES_URL =
  "https://pub-1b16e6dbfbeb4116b4cc74d50cc39952.r2.dev/tiles/province-2022.pmtiles";

export const PROVINCE_SOURCE_LAYER = "province";

export const MAP_CENTER = [24.7, -28.5];
/** pmtiles minZoom is 5 — tiles do not exist below this level. */
export const MAP_ZOOM = 5;
export const MAP_MIN_ZOOM = 5;

/** Bounds from province-2022.pmtiles header. */
export const SA_BOUNDS = [
  [16.45, -34.84],
  [32.94, -22.13],
];

export const MAP_ATTRIBUTION =
  "Boundaries: Statistics South Africa / Municipal Demarcation Board";

/** Normalize eTenders province strings to official tile `name` values. */
export const PROVINCE_ALIASES = {
  "Kwazulu-Natal": "KwaZulu-Natal",
  "kwazulu-natal": "KwaZulu-Natal",
  "KZN": "KwaZulu-Natal",
  "North-West": "North West",
  "north west": "North West",
  "Free-State": "Free State",
  "Western-Cape": "Western Cape",
  "Eastern-Cape": "Eastern Cape",
  "Northern-Cape": "Northern Cape",
};

export function normalizeProvinceName(name) {
  if (!name) return "";
  const trimmed = String(name).trim();
  return PROVINCE_ALIASES[trimmed] || trimmed;
}

export function pmtilesUrl(url) {
  return `pmtiles://${url}`;
}
