import { StackProvider, StackTheme } from "@stackframe/stack";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { stackClientApp } from "../stack/client";
import "./globals.css";
import { NavBar } from "@/components/nav/nav-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wikimasters",
  description: "A collaborative wiki platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <NavBar />
            {children}
            <Analytics />
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
