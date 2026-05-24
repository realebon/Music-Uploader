import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

const font = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Player",
  description: "Native music uploader",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.variable} antialiased`} style={{ background: 'transparent' }}>
        <Theme appearance="dark" accentColor="gray" radius="large" style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
          {children}
        </Theme>
      </body>
    </html>
  );
}
