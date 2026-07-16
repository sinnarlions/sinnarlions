export function cleanMemberName(name: string = ""): string {
  return name
    .replace(
      /^(Lion\s+)?(Dr\.|Er\.|Prof\.|CA|Adv\.|Mr\.|Mrs\.|Ms\.)\s+/i,
      ""
    )
    .trim();
}

export function sortMembersByName<T extends { name?: string }>(
  members: T[]
): T[] {
  return [...members].sort((a, b) =>
    cleanMemberName(a.name).localeCompare(
      cleanMemberName(b.name),
      "en",
      {
        sensitivity: "base",
      }
    )
  );
}