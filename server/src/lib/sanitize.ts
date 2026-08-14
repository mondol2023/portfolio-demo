import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

/**
 * Server-side HTML sanitizer. DOMPurify needs a DOM to operate against; in
 * Node we hand it a jsdom `window` explicitly (there's no global `window`
 * here). One jsdom instance + one DOMPurify instance are created lazily and
 * reused for the life of the process — jsdom construction isn't free, and
 * this module is on the hot path for every contact submission and (later)
 * every admin content save.
 */
const jsdomWindow = new JSDOM("").window;
const purify = DOMPurify(jsdomWindow as unknown as Window & typeof globalThis);

/** Strips all markup — used for plain-text fields (name, subject) where no HTML is ever valid. */
export function stripHtml(input: string): string {
  return purify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/**
 * Allowlist-sanitizes rich text — used for fields that are allowed a
 * constrained set of formatting (e.g. Tiptap-authored blog content on save,
 * Phase 10). Mirrors the client-side allowlist in `client/src/lib/sanitize.ts`
 * so server and client agree on what's safe.
 */
export function sanitizeRichText(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "b", "i", "u", "s", "a",
      "ul", "ol", "li", "h2", "h3", "h4", "blockquote",
      "code", "pre", "img", "hr",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/)/i,
  });
}
