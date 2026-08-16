import type { IconType } from "react-icons";
import { Card } from "@/components/ui";

interface StatCardProps {
  label: string;
  value: number;
  icon: IconType;
}

/** One overview metric — number formatted with locale separators so a real day's traffic doesn't read as an unbroken digit string. */
export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums text-base-50">{value.toLocaleString()}</p>
        <p className="text-sm text-base-400">{label}</p>
      </div>
    </Card>
  );
}
