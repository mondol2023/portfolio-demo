import DOMPurify from "dompurify";

/**
 * Sanitizes rich-text HTML before it's ever passed to `dangerouslySetInnerHTML`.
 * The server sanitizes on save too (defense in depth, per the plan's security
 * model), but nothing rendered client-side skips this — a compromised admin
 * write path or a future non-CMS content source shouldn't become an XSS vector.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "code",
      "pre",
      "img",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/)/i,
  });
}
