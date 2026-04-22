import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: 'Rangao - Premium Islamic Wall Decor & Gifts | Bangladesh',
    template: '%s | Rangao',
  },
  description: 'Discover premium Islamic wall decor, wooden items, and gift combos. Perfect for Eid, Ramadan, and special occasions. Fast delivery across Bangladesh.',
  keywords: ['Islamic wall decor', 'Muslim gifts', 'Eid gifts', 'Bangladesh', 'wooden plaques', 'calligraphy'],
  authors: [{ name: 'Rangao' }],
  creator: 'Rangao',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rangao.com',
    siteName: 'Rangao',
    title: 'Rangao - Premium Islamic Wall Decor & Gifts',
    description: 'Discover premium Islamic wall decor, wooden items, and gift combos.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rangao - Premium Islamic Wall Decor & Gifts',
    description: 'Discover premium Islamic wall decor, wooden items, and gift combos.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}