import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TickerProvider } from "@/contexts/TickerContext";
import { SWRProvider } from "@/components/SWRProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RichSlow - Vietnamese Stock Market Analysis",
  description: "Financial analysis dashboard for Vietnamese stock market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SWRProvider>
          <TickerProvider>
            {children}
            <Toaster />
          </TickerProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
