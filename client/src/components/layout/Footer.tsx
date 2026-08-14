import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { SITE_CONTENT_KEYS } from "@portfolio/shared";
import { useSiteContent } from "@/hooks/useApiQueries";

export function Footer() {
  const { data: content } = useSiteContent();
  const get = (key: string, fallback = "") => content?.[key] ?? fallback;

  const name = get(SITE_CONTENT_KEYS.heroName);
  const githubUrl = get(SITE_CONTENT_KEYS.heroGithubUrl);
  const linkedinUrl = get(SITE_CONTENT_KEYS.heroLinkedinUrl);
  const email = get(SITE_CONTENT_KEYS.heroEmail);

  return (
    <footer className="border-t border-base-800 bg-base-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between">
        <p className="text-sm text-base-400">
          &copy; {new Date().getFullYear()} {name}. Built with React, Tailwind &amp; Framer Motion.
        </p>

        <div className="flex items-center gap-4">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="text-base-400 transition-colors hover:text-base-50"
            >
              <FiGithub className="h-5 w-5" />
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="text-base-400 transition-colors hover:text-base-50"
            >
              <FiLinkedin className="h-5 w-5" />
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              aria-label="Email"
              className="text-base-400 transition-colors hover:text-base-50"
            >
              <FiMail className="h-5 w-5" />
            </a>
          )}
          <Link to="/privacy" className="text-sm text-base-400 transition-colors hover:text-base-50">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
