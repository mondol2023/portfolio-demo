import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowRight, FiFileText, FiGithub, FiLinkedin, FiMapPin } from "react-icons/fi";
import { skillCategories, SITE_CONTENT_KEYS } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { HeroIllustration } from "@/components/hero/HeroIllustration";
import { SkillLevelDots } from "@/components/skills/SkillLevelDots";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { ContactForm } from "@/components/contact/ContactForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { staggerContainer, fadeUp } from "@/lib/animations/variants";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { techIcons } from "@/lib/tech-icons";
import { cn } from "@/lib/cn";
import { Button, Badge } from "@/components/ui";
import { useSiteContent, useProjects, useBlogPosts, useSkills, useExperience } from "@/hooks/useApiQueries";

/**
 * One-page home, driven entirely by the public API (Phase 8): site copy via
 * `useSiteContent`, everything else via its own query hook. Each section
 * gates on its own query's loading state (via `Skeleton` placeholders) so a
 * slow endpoint never blocks the rest of the page from painting. Hero/About/
 * Skills/Experience/Projects/Blog are the Phase 3-6 builds; Contact (Phase 7)
 * pairs a validated, accessible `ContactForm` with `POST /api/contact`.
 */
export function HomePage() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const { data: content } = useSiteContent();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: posts, isLoading: blogLoading } = useBlogPosts();
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const { data: experience, isLoading: experienceLoading } = useExperience();

  const heroReady = Boolean(content);
  const get = (key: string, fallback = "") => content?.[key] ?? fallback;

  const heroName = get(SITE_CONTENT_KEYS.heroName);
  const heroHeadline = get(SITE_CONTENT_KEYS.heroHeadline);
  const heroDescription = get(SITE_CONTENT_KEYS.heroDescription);
  const heroAvatarUrl = get(SITE_CONTENT_KEYS.heroAvatarUrl);
  const heroGithubUrl = get(SITE_CONTENT_KEYS.heroGithubUrl);
  const heroLinkedinUrl = get(SITE_CONTENT_KEYS.heroLinkedinUrl);
  const heroResumeUrl = get(SITE_CONTENT_KEYS.heroResumeUrl);
  const heroEmail = get(SITE_CONTENT_KEYS.heroEmail);
  const aboutIntro = get(SITE_CONTENT_KEYS.aboutIntro);
  const aboutPhilosophy = get(SITE_CONTENT_KEYS.aboutPhilosophy);
  const contactLocation = get(SITE_CONTENT_KEYS.contactLocation);

  const stats = [
    { label: "Projects shipped", value: Number(get(SITE_CONTENT_KEYS.statsProjectsShipped, "0")), suffix: "+" },
    { label: "Happy clients", value: Number(get(SITE_CONTENT_KEYS.statsHappyClients, "0")), suffix: "+" },
    { label: "Commits this year", value: Number(get(SITE_CONTENT_KEYS.statsCommits, "0")), suffix: "" },
    { label: "Cups of coffee", value: Number(get(SITE_CONTENT_KEYS.statsCupsOfCoffee, "0")), suffix: "" },
  ];

  const featuredProjects = (projects ?? []).filter((p) => p.featured);
  const skillsByCategory = skillCategories
    .map((category) => ({ category, skills: (skills ?? []).filter((s) => s.category === category) }))
    .filter((group) => group.skills.length > 0);
  const publishedPosts = (posts ?? []).filter((post) => post.status === "published").slice(0, 3);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroParallaxY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroParallaxOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  const experienceRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: experienceProgress } = useScroll({
    target: experienceRef,
    offset: ["start 0.8", "end 0.4"],
  });
  const experienceLineScale = useTransform(experienceProgress, [0, 1], [0, 1]);

  return (
    <>
      {/* HERO */}
      <section id="hero" ref={heroRef} className="relative overflow-hidden px-6 py-28 sm:py-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-hero/15 via-transparent to-transparent"
        />
        <motion.div
          style={prefersReducedMotion ? undefined : { y: heroParallaxY, opacity: heroParallaxOpacity }}
          className="relative mx-auto max-w-4xl"
        >
          {heroReady ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-6 text-center"
            >
              <motion.div variants={fadeUp}>
                <HeroIllustration avatarUrl={heroAvatarUrl} name={heroName} />
              </motion.div>
              <motion.p variants={fadeUp} className="font-mono text-sm tracking-widest text-hero uppercase">
                Hi, I&apos;m {heroName}
              </motion.p>
              <motion.h1 variants={fadeUp} className="text-4xl font-semibold text-base-50 sm:text-6xl">
                {heroHeadline}
              </motion.h1>
              <motion.p variants={fadeUp} className="max-w-xl text-lg text-base-300">
                {heroDescription}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <Button onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}>
                  View projects <FiArrowRight aria-hidden="true" />
                </Button>
                <Button variant="outline" onClick={() => window.open(heroGithubUrl, "_blank", "noopener,noreferrer")}>
                  <FiGithub aria-hidden="true" /> GitHub
                </Button>
                <Button variant="outline" onClick={() => window.open(heroLinkedinUrl, "_blank", "noopener,noreferrer")}>
                  <FiLinkedin aria-hidden="true" /> LinkedIn
                </Button>
                <Button variant="ghost" onClick={() => window.open(heroResumeUrl, "_blank", "noopener,noreferrer")}>
                  <FiFileText aria-hidden="true" /> Resume
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center">
              <Skeleton circle className="h-72 w-72" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-12 w-80 max-w-full" />
              <Skeleton className="h-5 w-96 max-w-full" />
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <Skeleton className="h-11 w-36" />
                <Skeleton className="h-11 w-28" />
                <Skeleton className="h-11 w-32" />
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* ABOUT */}
      <section id="about" className="border-t border-base-800 bg-base-900/40 px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1.3fr_1fr]">
          {heroReady ? (
            <>
              <Reveal>
                <span className="font-mono text-xs uppercase tracking-widest text-about">About</span>
                <h2 className="mt-2 text-3xl font-semibold text-base-50">A little about my work</h2>
                <p className="mt-4 text-base-300">{aboutIntro}</p>
                <p className="mt-4 text-base-400">{aboutPhilosophy}</p>
                <p className="mt-4 flex items-center gap-2 text-sm text-base-400">
                  <FiMapPin aria-hidden="true" className="text-about" /> {contactLocation}
                </p>
              </Reveal>
              <Reveal
                variants={staggerContainer}
                className="grid grid-cols-2 gap-4 self-start rounded-2xl border border-base-800 bg-base-900 p-6"
              >
                {stats.map((stat) => (
                  <motion.div key={stat.label} variants={fadeUp} className="text-center">
                    <p className="text-2xl font-semibold text-about tabular-nums">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-1 text-xs text-base-400">{stat.label}</p>
                  </motion.div>
                ))}
              </Reveal>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-72 max-w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="grid grid-cols-2 gap-4 self-start rounded-2xl border border-base-800 bg-base-900 p-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="border-t border-base-800 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-skills">Skills</span>
            <h2 className="mt-2 text-3xl font-semibold text-base-50">Tools I reach for</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skillsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-base-800 bg-base-900 p-5">
                    <Skeleton className="h-3 w-24" />
                    <div className="mt-4 space-y-3">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                ))
              : skillsByCategory.map((group) => (
                  <Reveal key={group.category} margin="-40px" className="rounded-2xl border border-base-800 bg-base-900 p-5">
                    <h3 className="text-sm font-semibold text-skills">{group.category}</h3>
                    <motion.ul
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-40px" }}
                      className="mt-4 space-y-3"
                    >
                      {group.skills.map((skill) => {
                        const meta = techIcons[skill.iconKey];
                        const Icon = meta?.Icon;
                        return (
                          <motion.li key={skill.id} variants={fadeUp} className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-sm text-base-200">
                              {Icon && <Icon aria-hidden="true" size={15} color={meta.color} />}
                              {skill.name}
                            </span>
                            <SkillLevelDots level={skill.level} fillClassName="bg-skills" />
                          </motion.li>
                        );
                      })}
                    </motion.ul>
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="border-t border-base-800 bg-base-900/40 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-experience">Experience</span>
            <h2 className="mt-2 text-3xl font-semibold text-base-50">Where I&apos;ve worked</h2>
          </Reveal>
          {experienceLoading ? (
            <div className="mt-10 space-y-10 pl-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-64 max-w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div ref={experienceRef} className="relative mt-10 space-y-10 pl-6">
              {/* Static track + scroll-drawn progress line */}
              <div aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-base-800" />
              <motion.div
                aria-hidden="true"
                className="absolute left-0 top-0 w-px origin-top bg-experience"
                style={{ height: "100%", scaleY: prefersReducedMotion ? 1 : experienceLineScale }}
              />
              {(experience ?? []).map((role) => (
                <Reveal key={role.id} margin="-40px" className="relative">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -left-6 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-base-950",
                      role.isCurrent ? "bg-experience" : "bg-base-600"
                    )}
                  />
                  <p className="text-xs font-mono uppercase tracking-widest text-experience">
                    {role.startDate.slice(0, 7)} — {role.isCurrent ? "Present" : role.endDate?.slice(0, 7)}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-base-50">
                    {role.position} <span className="text-base-400">· {role.company}</span>
                  </h3>
                  <p className="mt-2 text-base-300">{role.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {role.technologies.map((tech) => (
                      <Badge key={tech} tone="experience">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="border-t border-base-800 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-projects">Projects</span>
            <h2 className="mt-2 text-3xl font-semibold text-base-50">Selected work</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {projectsLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
              : featuredProjects.map((project) => (
                  <Reveal key={project.id} margin="-40px">
                    <ProjectCard project={project} maxTechnologies={4} />
                  </Reveal>
                ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" onClick={() => navigate("/projects")}>
              View all projects <FiArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="border-t border-base-800 bg-base-900/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-blog">Blog</span>
            <h2 className="mt-2 text-3xl font-semibold text-base-50">Recent writing</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {blogLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)
              : publishedPosts.map((post) => (
                  <Reveal key={post.id} margin="-40px">
                    <BlogCard post={post} maxTags={2} />
                  </Reveal>
                ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" onClick={() => navigate("/blog")}>
              View all posts <FiArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-t border-base-800 px-6 py-24">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-contact">Contact</span>
          <h2 className="mt-2 text-3xl font-semibold text-base-50">Let&apos;s build something</h2>
          <p className="mt-4 text-base-300">Have a project in mind or just want to say hi? Send a message below.</p>
        </Reveal>

        <ContactForm />

        {heroEmail && (
          <p className="mt-6 text-center text-sm text-base-400">
            Prefer email?{" "}
            <a href={`mailto:${heroEmail}`} className="text-contact underline-offset-4 hover:underline">
              {heroEmail}
            </a>
          </p>
        )}
      </section>
    </>
  );
}
