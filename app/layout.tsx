import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Behaviour Journal',
  description: 'Track and manage children behaviour incidents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
