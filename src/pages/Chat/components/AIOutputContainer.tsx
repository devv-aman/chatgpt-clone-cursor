import { useState, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "./CodeBlock";
import { CHAT_STRINGS } from "../constants";
import type { Components } from "react-markdown";

interface AIOutputContainerProps {
  content: string;
  isStreaming: boolean;
  tokensUsed?: number | null;
  showThinking?: boolean;
}

export function AIOutputContainer({
  content,
  isStreaming,
  tokensUsed,
  showThinking = false,
}: AIOutputContainerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [content]);

  const components: Components = useMemo(
    () => ({
      code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        const isInline = !match && !className;

        if (isInline) {
          return (
            <code
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
              {...props}
            >
              {children}
            </code>
          );
        }

        return (
          <CodeBlock language={match?.[1]}>
            {String(children).replace(/\n$/, "")}
          </CodeBlock>
        );
      },
      pre({ children }) {
        // Just render children directly since CodeBlock handles the container
        return <>{children}</>;
      },
      p({ children }) {
        return <p className="mb-4 last:mb-0">{children}</p>;
      },
      ul({ children }) {
        return <ul className="mb-4 list-disc pl-6 last:mb-0">{children}</ul>;
      },
      ol({ children }) {
        return <ol className="mb-4 list-decimal pl-6 last:mb-0">{children}</ol>;
      },
      li({ children }) {
        return <li className="mb-1">{children}</li>;
      },
      h1({ children }) {
        return <h1 className="mb-4 text-2xl font-bold">{children}</h1>;
      },
      h2({ children }) {
        return <h2 className="mb-3 text-xl font-bold">{children}</h2>;
      },
      h3({ children }) {
        return <h3 className="mb-2 text-lg font-semibold">{children}</h3>;
      },
      blockquote({ children }) {
        return (
          <blockquote className="mb-4 border-l-4 border-border pl-4 italic text-muted-foreground">
            {children}
          </blockquote>
        );
      },
      a({ href, children }) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            {children}
          </a>
        );
      },
      hr() {
        return <hr className="my-4 border-border" />;
      },
      table({ children }) {
        return (
          <div className="mb-4 overflow-x-auto">
            <table className="min-w-full border-collapse border border-border">
              {children}
            </table>
          </div>
        );
      },
      th({ children }) {
        return (
          <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
            {children}
          </th>
        );
      },
      td({ children }) {
        return <td className="border border-border px-4 py-2">{children}</td>;
      },
    }),
    []
  );

  // Show thinking state
  if (showThinking && !content) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 text-muted-foreground">
        <Brain className="size-4" />
        <span>{CHAT_STRINGS.THINKING}</span>
        <Loader2 className="size-4 animate-spin" />
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="group relative">
      <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
        <ReactMarkdown components={components}>{content}</ReactMarkdown>
        {isStreaming && (
          <span className="inline-block h-4 w-2 animate-pulse bg-foreground" />
        )}
      </div>

      {/* Footer with tokens and copy button */}
      {!isStreaming && content && (
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-3">
          {tokensUsed !== null && tokensUsed !== undefined && (
            <span className="text-xs text-muted-foreground">
              {tokensUsed.toLocaleString()} {CHAT_STRINGS.TOKENS_LABEL}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="size-7 text-muted-foreground hover:text-foreground"
            aria-label={
              copied ? CHAT_STRINGS.COPIED_LABEL : CHAT_STRINGS.COPY_LABEL
            }
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
