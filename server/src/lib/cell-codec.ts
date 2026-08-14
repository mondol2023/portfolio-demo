/** Encode/decode a `string[]` field into a single spreadsheet cell. */
export function encodeArray(values: readonly string[]): string {
  return JSON.stringify(values);
}

export function decodeArray(cell: string | undefined): string[] {
  if (!cell) return [];
  try {
    const parsed: unknown = JSON.parse(cell);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
