import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import { motionTokens, springs } from "@/lib/animations/tokens";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useActiveSection } from "@/hooks/useActiveSection";

const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
] as const;

const SECTION_IDS = NAV_LINKS.map((link) => link.id);

export function Navbar() {
  const { scrolled, direction } = useScrollDirection();
  const activeId = useActiveSection(SECTION_IDS);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === "/";

  const goToSection = (id: string) => {
    setMobileOpen(false);
    if (onHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <motion.header
      animate={{ y: direction === "down" && scrolled && !mobileOpen ? -96 : 0 }}
      transition={springs.gentle}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || mobileOpen ? "bg-base-950/80 shadow-lg shadow-black/20 backdrop-blur-lg" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6" aria-label="Primary">
        <Link
          to="/"
          className="font-mono text-sm font-semibold tracking-widest text-base-50 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero rounded"
        >
          Alex<span className="text-hero">.</span>Rivera
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id} className="relative">
              <button
                type="button"
                onClick={() => goToSection(link.id)}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero",
                  activeId === link.id && onHome ? "text-base-50" : "text-base-300 hover:text-base-50"
                )}
              >
                {link.label}
                {activeId === link.id && onHome && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    transition={springs.snappy}
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-hero"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="rounded-md p-2 text-base-100 hover:bg-base-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero md:hidden"
        >
          {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
            className="overflow-hidden md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 pb-6">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => goToSection(link.id)}
                    className={cn(
                      "block w-full rounded-md px-3 py-2.5 text-left text-base font-medium transition-colors",
                      activeId === link.id && onHome ? "bg-base-800 text-base-50" : "text-base-300 hover:bg-base-800 hover:text-base-50"
                    )}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
