export function truncateLabel(value, max = 14) {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export const CHART_HEIGHT = 360;

export function verticalBarChartHeight(itemCount) {
  return Math.max(240, Math.min(440, itemCount * 26 + 48));
}
