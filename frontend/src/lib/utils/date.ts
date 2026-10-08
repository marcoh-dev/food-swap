export function getCurrentIsoDate(): string {
  return new Date().toISOString();
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});;
}