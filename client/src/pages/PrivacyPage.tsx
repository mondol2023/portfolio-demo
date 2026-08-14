import { Reveal } from "@/components/animations/Reveal";
import { SITE_CONTENT_KEYS } from "@portfolio/shared";
import { useSiteContent } from "@/hooks/useApiQueries";

function buildSections(email: string) {
  return [
    {
      heading: "What this site collects",
      body: "This site records anonymous visit analytics — the page viewed, referrer, a coarse device/browser/OS fingerprint, and an approximate country/region derived from IP address. It's used only to understand which content is useful and to spot broken pages.",
    },
    {
      heading: "What it doesn't collect",
      body: "Your IP address is never stored in raw form and is never shown in the admin dashboard. Before anything is saved, the IP is used once to look up a country/region locally, then discarded — only a salted one-way hash of it is kept, solely to approximate unique visitors without identifying you.",
    },
    {
      heading: "Cookies",
      body: "The public site sets no tracking cookies. The admin area (used only by the site owner) sets a strictly-necessary, httpOnly session cookie required to stay signed in — it isn't used for tracking and isn't set for visitors browsing the public pages.",
    },
    {
      heading: "The contact form",
      body: "If you submit the contact form, your name, email, and message are stored so they can be replied to. That's the only place this site asks you for personal information directly.",
    },
    {
      heading: "Third parties",
      body: "This site doesn't sell or share data with advertisers or third-party trackers. There is no ad network and no cross-site tracking pixel on this domain.",
    },
    {
      heading: "Contact",
      body: email ? `Questions about this policy can be sent to ${email}.` : "Questions about this policy can be sent via the contact form on this site.",
    },
  ];
}

export function PrivacyPage() {
  const { data: content } = useSiteContent();
  const email = content?.[SITE_CONTENT_KEYS.heroEmail] ?? "";
  const SECTIONS = buildSections(email);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Reveal>
        <span className="font-mono text-xs uppercase tracking-widest text-contact">Legal</span>
        <h1 className="mt-2 text-3xl font-semibold text-base-50">Privacy Policy</h1>
        <p className="mt-4 text-base-300">
          This page explains, in plain language, what data this site collects and why. It's written to be
          accurate to how the site is actually built, not boilerplate.
        </p>
      </Reveal>

      <div className="mt-12 space-y-10">
        {SECTIONS.map((section) => (
          <Reveal key={section.heading} margin="-40px">
            <h2 className="text-lg font-semibold text-base-50">{section.heading}</h2>
            <p className="mt-2 text-base-300">{section.body}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
