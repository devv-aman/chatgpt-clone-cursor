import { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CHAT_STRINGS } from '../constants';

interface CodeBlockProps {
  language: string | undefined;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [children]);

  // Detect if we're in dark mode
  const isDark = document.documentElement.classList.contains('dark');
  const style = isDark ? oneDark : oneLight;

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between bg-muted px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {language || 'code'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 text-xs"
          aria-label={copied ? CHAT_STRINGS.COPIED_LABEL : CHAT_STRINGS.COPY_LABEL}
        >
          {copied ? (
            <>
              <Check className="size-3" />
              {CHAT_STRINGS.COPIED_LABEL}
            </>
          ) : (
            <>
              <Copy className="size-3" />
              {CHAT_STRINGS.COPY_LABEL}
            </>
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={style}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: 'var(--code-bg)',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            fontSize: '0.875rem',
          },
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

