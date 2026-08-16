import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DeviceType } from "@portfolio/shared";
import { CHART_CATEGORICAL } from "@/lib/chartColors";

interface DeviceDonutProps {
  data: { device: DeviceType; count: number }[];
}

const DEVICE_LABEL: Record<DeviceType, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
  bot: "Bot",
  unknown: "Unknown",
};

export function DeviceDonut({ data }: DeviceDonutProps) {
  if (data.length === 0) {
    return <p className="text-sm text-base-500">No data yet.</p>;
  }

  const chartData = data.map((d) => ({ name: DEVICE_LABEL[d.device], value: d.count }));

  return (
    <div className="flex items-center gap-4">
      <div className="h-40 w-40 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={44} outerRadius={64} paddingAngle={2}>
              {chartData.map((entry, i) => (
                <Cell key={entry.name} fill={CHART_CATEGORICAL[i % CHART_CATEGORICAL.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
              contentStyle={{
                background: "#12141f",
                border: "1px solid #1b1e2c",
                borderRadius: 8,
                color: "#f3f4f6",
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {chartData.map((entry, i) => (
          <li key={entry.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ background: CHART_CATEGORICAL[i % CHART_CATEGORICAL.length] }}
              aria-hidden="true"
            />
            <span className="text-base-300">{entry.name}</span>
            <span className="tabular-nums text-base-500">{entry.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
