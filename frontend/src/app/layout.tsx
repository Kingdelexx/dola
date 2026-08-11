import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import RocketCursor from "@/components/RocketCursor";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dolacode - Kids & Schools Interactive Coding Platform",
  description: "Dolacode is an interactive STEM and programming education application for kids, parents, and schools. Sign in with Google to create accounts, build games, track learning progress across coding stages, and manage student rosters.",
  applicationName: "Dolacode",
  authors: [{ name: "Devnaija Academy" }],
  keywords: ["Dolacode", "DolaCode", "Kids Coding", "Block Coding", "Python for Kids", "Devnaija Academy"],
  openGraph: {
    title: "Dolacode - Kids & Schools Interactive Coding Platform",
    description: "Dolacode is an interactive STEM and programming education application for kids, parents, and schools. Sign in with Google to create accounts, build games, track learning progress across coding stages, and manage student rosters.",
    siteName: "Dolacode",
    type: "website",
  },
  icons: {
    icon: "/logo-icon.png",
    shortcut: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
  verification: {
    google: "googlede0d261a8b5ba13e",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script 
          src="https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js" 
          strategy="beforeInteractive"
        />
        <AuthProvider>
          {children}
          <RocketCursor />
        </AuthProvider>
      </body>
    </html>
  );
}
