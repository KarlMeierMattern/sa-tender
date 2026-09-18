export function getQueryGroupStatus(queries) {
  const entries = Object.values(queries);
  return {
    isLoading: entries.some((q) => q.isLoading),
    isError: entries.some((q) => q.isError),
    refetch: () => entries.forEach((q) => q.refetch?.()),
  };
}
