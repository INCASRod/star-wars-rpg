import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HOLOCRON // Campaign Manager",
  description: "Star Wars RPG Campaign Manager — FFG/Genesys System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rajdhani.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
