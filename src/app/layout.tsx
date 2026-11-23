import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyber Academy // Tactical LMS Platform',
  description: 'Full-stack cybersecurity learning platform with native video streaming, in-app PDF readers, and interactive Red Team roadmap.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      <body className="min-h-full flex flex-col bg-[#090D16] text-[#E5E7EB] font-sans">
        {children}
      </body>
    </html>
  );
}
