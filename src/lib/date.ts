export function formatMonthYear(value: string | null): string {
  if (!value) return "Present";
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatFullDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
