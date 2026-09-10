import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OC3 Company World',
  description: 'OC3 AI Operations Command Center',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
