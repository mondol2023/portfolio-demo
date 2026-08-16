import { useParams } from "react-router-dom";
import { FiArrowLeft, FiClock, FiEye, FiGlobe, FiMonitor, FiMapPin } from "react-icons/fi";
import { Reveal } from "@/components/animations/Reveal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge, Card, LinkButton, Skeleton } from "@/components/ui";
import { useAdminVisitorSession } from "@/hooks/admin/useAdminAnalytics";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

export function AdminVisitorSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data, isLoading, isError } = useAdminVisitorSession(sessionId);

  return (
    <Reveal className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <LinkButton to="/admin/analytics" variant="ghost" size="sm">
          <FiArrowLeft aria-hidden="true" /> Back to analytics
        </LinkButton>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError || !data ? (
        <Card className="text-center text-sm text-base-400">
          No session found with that id — it may have aged out of the event log.
        </Card>
      ) : (
        <>
          <AdminPageHeader
            title="Visitor session"
            description={`${data.session.pageCount} page${data.session.pageCount === 1 ? "" : "s"} · ${formatDuration(
              data.session.durationSeconds
            )} · entered on ${data.session.entryPath}`}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex items-center gap-3">
              <FiClock className="h-5 w-5 flex-shrink-0 text-info" aria-hidden="true" />
              <div>
                <p className="text-xs text-base-400">First → last seen</p>
                <p className="text-sm text-base-200">
                  {new Date(data.session.firstSeen).toLocaleTimeString()} →{" "}
                  {new Date(data.session.lastSeen).toLocaleTimeString()}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <FiMonitor className="h-5 w-5 flex-shrink-0 text-info" aria-hidden="true" />
              <div>
                <p className="text-xs text-base-400">Device</p>
                <p className="text-sm text-base-200">
                  {data.session.deviceType} · {data.session.browser} · {data.session.os}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <FiMapPin className="h-5 w-5 flex-shrink-0 text-info" aria-hidden="true" />
              <div>
                <p className="text-xs text-base-400">Country</p>
                <p className="text-sm text-base-200">{data.session.country ?? "Unknown"}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <FiGlobe className="h-5 w-5 flex-shrink-0 text-info" aria-hidden="true" />
              <div>
                <p className="text-xs text-base-400">Referrer</p>
                <p className="truncate text-sm text-base-200" title={data.session.referrer ?? "Direct"}>
                  {data.session.referrer ?? "Direct"}
                </p>
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="mb-4 text-sm font-medium text-base-200">Timeline</h2>
            <ol className="relative flex flex-col gap-5 border-l border-base-700 pl-6">
              {data.timeline.map((entry, i) => (
                <li key={`${entry.timestamp}-${i}`} className="relative">
                  <span
                    className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full border-2 border-base-800 bg-info"
                    aria-hidden="true"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={entry.type === "pageview" ? "info" : "success"}>
                      {entry.type === "pageview" ? (
                        <span className="flex items-center gap-1">
                          <FiEye aria-hidden="true" /> pageview
                        </span>
                      ) : (
                        (entry.eventName ?? "event")
                      )}
                    </Badge>
                    <span className="text-sm text-base-200">{entry.path}</span>
                    {entry.eventLabel && <span className="text-sm text-base-400">— {entry.eventLabel}</span>}
                  </div>
                  <p className="mt-1 text-xs text-base-500">{new Date(entry.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ol>
          </Card>
        </>
      )}
    </Reveal>
  );
}
