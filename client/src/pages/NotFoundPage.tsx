import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Reveal } from "@/components/animations/Reveal";
import { Button } from "@/components/ui";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-6 py-24 text-center">
      <Reveal className="flex flex-col items-center gap-4">
        <p className="font-mono text-8xl font-semibold text-hero/30">404</p>
        <h1 className="text-2xl font-semibold text-base-50">This page took a wrong turn.</h1>
        <p className="max-w-sm text-base-300">
          The page you're looking for doesn't exist, or it moved. Let's get you back on track.
        </p>
        <Button onClick={() => navigate("/")}>
          <FiArrowLeft aria-hidden="true" /> Back home
        </Button>
      </Reveal>
    </div>
  );
}
