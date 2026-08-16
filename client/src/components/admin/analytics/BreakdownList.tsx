interface BreakdownRow {
  label: string;
  count: number;
}

interface BreakdownListProps {
  title: string;
  rows: BreakdownRow[];
  emptyLabel?: string;
}

/**
 * A ranked label/count list with a proportional bar behind each row —
 * favored over a chart-per-metric here since five of these sit in one grid
 * and a bar list stays scannable at that density where a full chart
 * wouldn't (top pages, referrers, browsers, OSes, countries).
 */
export function BreakdownList({ title, rows, emptyLabel = "No data yet." }: BreakdownListProps) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-base-200">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-base-500">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <li key={row.label} className="relative overflow-hidden rounded-md">
              <div
                className="absolute inset-y-0 left-0 rounded-md bg-info/10"
                style={{ width: `${(row.count / max) * 100}%` }}
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between gap-3 px-2.5 py-1.5 text-sm">
                <span className="truncate text-base-300" title={row.label}>
                  {row.label}
                </span>
                <span className="flex-shrink-0 tabular-nums text-base-400">{row.count.toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
