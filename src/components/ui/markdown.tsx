import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { expandReferences } from "@/lib/references";
import { isSafeExternalUrl } from "@/lib/safe-url";

/**
 * Renders editorial Markdown safely: raw HTML is never rendered (react-markdown
 * escapes it), links are limited to internal paths and http(s) URLs, and
 * images are not allowed inline (use image records instead).
 */
export function Markdown({ children, className = "prose-folio" }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        disallowedElements={["img"]}
        unwrapDisallowed
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith("/") && !href.startsWith("//")) return <Link href={href}>{children}</Link>;
            if (href && isSafeExternalUrl(href))
              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            return <span>{children}</span>;
          },
          h1: ({ children }) => <h2>{children}</h2>,
        }}
      >
        {expandReferences(children)}
      </ReactMarkdown>
    </div>
  );
}
