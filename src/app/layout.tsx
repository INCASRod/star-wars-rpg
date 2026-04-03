import type { Metadata, Viewport } from "next";
import { Rajdhani } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const swRpgIcons = localFont({
  src: "../../public/fonts/sw-rpg-icons.ttf",
  variable: "--font-sw-rpg-icons",
  display: "block",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

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
        className={`${rajdhani.variable} ${swRpgIcons.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
