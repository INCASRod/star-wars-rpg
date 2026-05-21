import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { ThemeInit } from "@/components/ThemeInit";
import "./globals.css";

const signika = localFont({
  src: "../../public/fonts/Signika/Signika-VariableFont_GRAD,wght.ttf",
  variable: "--font-display",
  display: "swap",
  weight: "300 700",
});

const palanquin = localFont({
  src: [
    { path: "../../public/fonts/Palanquin/Palanquin-Light.ttf",    weight: "300", style: "normal" },
    { path: "../../public/fonts/Palanquin/Palanquin-Regular.ttf",  weight: "400", style: "normal" },
    { path: "../../public/fonts/Palanquin/Palanquin-Medium.ttf",   weight: "500", style: "normal" },
    { path: "../../public/fonts/Palanquin/Palanquin-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Palanquin/Palanquin-Bold.ttf",     weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
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
    <html lang="en" className={`${signika.variable} ${palanquin.variable} ${swRpgIcons.variable}`}>
      <body className="antialiased">
        <ThemeInit />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
