import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { techIcons } from "@/lib/tech-icons";

/** Orbit order — six technologies, evenly spaced around the ring. */
const ORBIT_KEYS = ["react", "typescript", "nodejs", "tailwindcss", "postgresql", "docker"];
const ORBIT_RADIUS = 108;
const ORBIT_DURATION = 26;

interface HeroIllustrationProps {
  avatarUrl: string;
  name: string;
}

/**
 * Custom animated illustration standing in for an AI-generated hero photo:
 * a center avatar ringed by continuously-orbiting tech-logo badges (each
 * badge counter-rotates against the ring so the glyph itself stays upright),
 * an ambient breathing glow, and a mouse-follow tilt on the whole group.
 * Every layer freezes to a static, non-tilted, non-orbiting state under
 * `prefers-reduced-motion`.
 */
export function HeroIllustration({ avatarUrl, name }: HeroIllustrationProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  const orbitAnimation = prefersReducedMotion
    ? undefined
    : { rotate: 360 };
  const orbitTransition = { duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" as const };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto aspect-square w-72"
      style={{ perspective: 800 }}
    >
      {/* Ambient breathing glow */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-6 rounded-full bg-hero/30 blur-3xl"
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Mouse-tilt group */}
      <motion.div
        className="absolute inset-0"
        style={
          prefersReducedMotion
            ? undefined
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
      >
        {/* Orbit guide ring — radius set a touch inside the badges so they read as sitting on it */}
        <div
          aria-hidden="true"
          className="absolute rounded-full border border-hero/15"
          style={{ inset: 144 - (ORBIT_RADIUS - 8) }}
        />

        {/* Orbiting tech badges */}
        <motion.div className="absolute inset-0" animate={orbitAnimation} transition={orbitTransition}>
          {ORBIT_KEYS.map((key, index) => {
            const meta = techIcons[key];
            if (!meta) return null;
            const angle = (360 / ORBIT_KEYS.length) * index;
            const Icon = meta.Icon;

            return (
              <div
                key={key}
                className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
                style={{ transform: `rotate(${angle}deg) translateY(-${ORBIT_RADIUS}px)` }}
              >
                <motion.div
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-base-700 bg-base-900/90 shadow-lg backdrop-blur"
                  animate={prefersReducedMotion ? undefined : { rotate: -360 }}
                  transition={orbitTransition}
                  title={meta.label}
                >
                  <Icon aria-hidden="true" size={18} color={meta.color} />
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Center avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-hero/50 shadow-2xl shadow-hero/30">
            <img
              src={avatarUrl}
              alt={name}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
