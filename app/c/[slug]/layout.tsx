import type { Viewport } from 'next';

export const viewport: Viewport = {
  viewportFit: 'cover',
};

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
