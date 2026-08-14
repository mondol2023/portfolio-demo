import { Reveal } from "@/components/animations/Reveal";

interface RouteStubProps {
  title: string;
  description?: string;
}

/**
 * Placeholder for a route whose real implementation lands in a later phase.
 * Keeps the full route tree navigable (and link targets, active-nav state,
 * etc. testable) before every page has real content.
 */
export function RouteStub({ title, description }: RouteStubProps) {
  return (
    <div className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <Reveal className="flex flex-col items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-base-400">Coming soon</span>
        <h1 className="text-2xl font-semibold text-base-50">{title}</h1>
        {description && <p className="text-base-300">{description}</p>}
      </Reveal>
    </div>
  );
}
