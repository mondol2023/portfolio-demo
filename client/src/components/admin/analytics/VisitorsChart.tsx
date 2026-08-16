import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_ACCENT, CHART_GRID, CHART_MUTED_TEXT } from "@/lib/chartColors";

interface VisitorsChartProps {
  data: { date: string; count: number }[];
}

function formatDateLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function VisitorsChart({ data }: VisitorsChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_ACCENT} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART_ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_GRID} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fill: CHART_MUTED_TEXT, fontSize: 12 }}
            axisLine={{ stroke: CHART_GRID }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: CHART_MUTED_TEXT, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            labelFormatter={(value) => formatDateLabel(String(value))}
            formatter={(value) => [Number(value).toLocaleString(), "Visitors"]}
            contentStyle={{
              background: "#12141f",
              border: "1px solid #1b1e2c",
              borderRadius: 8,
              color: "#f3f4f6",
              fontSize: 13,
            }}
          />
          <Area type="monotone" dataKey="count" stroke={CHART_ACCENT} strokeWidth={2} fill="url(#visitorsFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
