import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PC Lagbe? | Smart PC Building Assistant",
  description: "AI-powered PC building assistant for Bangladesh. Find the perfect parts for your budget.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <AnnouncementBanner />
            <Navbar />
            <main className="flex-1 shrink-0 bg-transparent flex flex-col relative">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
