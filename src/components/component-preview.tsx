import type { ReactNode } from 'react';

interface ComponentPreviewProps {
  children: ReactNode;
}

export function ComponentPreview({ children }: ComponentPreviewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="flex items-center justify-center">{children}</div>
    </div>
  );
}
