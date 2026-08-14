import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { pageTransition } from "@/lib/animations/variants";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Route-level transition wrapper. Keyed on `pathname` so navigating routes
 * triggers exit-then-enter (`mode="wait"` per the motion-patterns rule —
 * enter must not start until exit completes). Mount this once, above
 * `<Routes>`, wrapping the routed element.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
