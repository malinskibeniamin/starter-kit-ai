'use client';

import { type UseInViewOptions, useInView } from 'motion/react';
import * as React from 'react';
import { CopyButton } from '@/components/redpanda-ui/copy-button';
import { useTheme } from '@/components/redpanda-ui/theme-provider';
import { cn } from '@/lib/utils';

type CodeEditorProps = Omit<React.ComponentProps<'div'>, 'onCopy'> & {
  children: string;
  lang: string;
  themes?: {
    light: string;
    dark: string;
  };
  header?: boolean;
  dots?: boolean;
  icon?: React.ReactNode;
  inView?: boolean;
  inViewMargin?: UseInViewOptions['margin'];
  inViewOnce?: boolean;
  copyButton?: boolean;
  title?: string;
  onDone?: () => void;
  onCopy?: (content: string) => void;
  testId?: string;
};

/**
 * This is a custom code editor component from Animate UI.
 * It had to be adjusted manually to work with dark mode agnostically, without using next-themes package.
 * It relies on ThemeProvider context instead.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: part of code editor implementation
function CodeEditor({
  children: code,
  lang,
  themes = {
    light: 'github-light',
    dark: 'github-dark',
  },
  className,
  header = true,
  dots = true,
  icon,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  copyButton = false,
  title,
  onDone,
  onCopy,
  testId,
  ...props
}: CodeEditorProps) {
  const { theme } = useTheme();

  const editorRef = React.useRef<HTMLDivElement>(null);
  const [visibleCode, setVisibleCode] = React.useState(''); // TODO: Future: Add animation
  const [highlightedCode, setHighlightedCode] = React.useState('');

  const inViewResult = useInView(editorRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;

  React.useEffect(() => {
    if (!visibleCode.length || !isInView) return;

    const loadHighlightedCode = async () => {
      try {
        const { codeToHtml } = await import('shiki');

        const highlighted = await codeToHtml(visibleCode, {
          lang,
          themes: {
            light: themes.light,
            dark: themes.dark,
          },
          defaultColor: theme === 'dark' ? 'dark' : 'light',
        });

        setHighlightedCode(highlighted);
      } catch (e) {
        console.error(`Language "${lang}" could not be loaded.`, e);
      }
    };

    loadHighlightedCode();
  }, [lang, themes, isInView, visibleCode, theme]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: needed for animation
  React.useEffect(() => {
    setVisibleCode(code);
    onDone?.();
    return;
  }, [code, isInView, onDone]);

  return (
    <div
      data-slot="code-editor"
      data-testid={testId}
      className={cn(
        'relative bg-card w-[600px] h-[400px] border border-border overflow-hidden flex flex-col rounded-xl',
        className,
      )}
      {...props}
    >
      {header ? (
        <div className="bg-muted border-b border-border relative flex flex-row items-center justify-between gap-y-2 h-10 px-4">
          {dots && (
            <div className="flex flex-row gap-x-2">
              <div className="size-2 rounded-full bg-red-500" />
              <div className="size-2 rounded-full bg-yellow-500" />
              <div className="size-2 rounded-full bg-green-500" />
            </div>
          )}

          {title && (
            <div
              className={cn(
                'flex flex-row items-center gap-2',
                dots && 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              )}
            >
              {icon ? (
                <div
                  className="text-muted-foreground [&_svg]:size-3.5"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: no XSS risk
                  // biome-ignore lint/security/noDangerouslySetInnerHtmlWithChildren: no XSS risk
                  dangerouslySetInnerHTML={typeof icon === 'string' ? { __html: icon } : undefined}
                >
                  {typeof icon !== 'string' ? icon : null}
                </div>
              ) : null}
              <figcaption className="flex-1 truncate text-muted-foreground text-[13px]">{title}</figcaption>
            </div>
          )}

          {copyButton ? (
            <CopyButton
              content={code}
              size="sm"
              variant="ghost"
              className="-me-2 bg-transparent hover:bg-primary/10"
              onCopy={onCopy}
            />
          ) : null}
        </div>
      ) : (
        copyButton && (
          <CopyButton
            content={code}
            size="sm"
            variant="ghost"
            className="absolute right-2 top-2 z-[2] backdrop-blur-md bg-transparent hover:bg-primary/10"
            onCopy={onCopy}
          />
        )
      )}
      <div
        ref={editorRef}
        className="h-[calc(100%-2.75rem)] w-full text-sm p-4 font-mono relative overflow-auto flex-1"
      >
        <div
          className={cn(
            '[&>pre,_&_code]:!bg-transparent [&>pre,_&_code]:[background:transparent_!important] [&>pre,_&_code]:border-none [&_code]:!text-[13px]',
          )}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: no XSS risk
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </div>
  );
}

export { CodeEditor, type CodeEditorProps };
