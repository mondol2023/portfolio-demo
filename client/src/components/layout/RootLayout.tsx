import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageTransition } from "@/components/animations/PageTransition";
import { useScrollToHash } from "@/hooks/useScrollToHash";

export function RootLayout() {
  useScrollToHash();

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-hero focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      {/* pt-16 offsets the fixed navbar (h-16); flex-1 keeps the footer pinned
          to the bottom of short pages. PageTransition's own wrapper div sits
          inside, so it doesn't need to participate in this flex sizing. */}
      <main id="main-content" className="flex-1 pt-16">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
