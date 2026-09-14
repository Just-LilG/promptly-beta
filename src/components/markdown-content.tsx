import ReactMarkdown from "react-markdown";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="text-[14px] leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2.5">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-2.5 pl-4 flex flex-col gap-1 list-disc">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2.5 pl-4 flex flex-col gap-1 list-decimal">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <p className="font-semibold text-[15px] mb-1.5 mt-1">{children}</p>,
          h2: ({ children }) => <p className="font-semibold text-[14.5px] mb-1.5 mt-1">{children}</p>,
          h3: ({ children }) => <p className="font-semibold mb-1 mt-1">{children}</p>,
          code: ({ children, className }) => {
            const isBlock = Boolean(className); // block code gets a language className, inline doesn't
            if (isBlock) {
              return (
                <code className="block font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">
                  {children}
                </code>
              );
            }
            return (
              <code className="font-mono text-[12.5px] bg-background px-1.5 py-0.5 rounded-[4px]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-2.5 p-3 rounded-[var(--radius-sm)] bg-background border border-border overflow-x-auto">
              {children}
            </pre>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent pl-3 mb-2.5 text-muted">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
