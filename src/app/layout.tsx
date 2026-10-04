import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const googleSans = localFont({
  src: [
    { path: "./fonts/google-sans-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/google-sans-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/google-sans-600.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-google-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Md. Fakhrul Alam Shuvo — WordPress & Full-Stack Web Developer",
  description: "WordPress and full-stack web developer in Dhaka, building fast, stable websites and applications.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Md. Fakhrul Alam Shuvo — WordPress & Full-Stack Web Developer",
    description: "Fast, stable WordPress builds and full-stack web applications.",
    siteName: "Md. Fakhrul Alam Shuvo",
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image.png"] },
};

export const viewport: Viewport = { themeColor: "#02060a", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={googleSans.variable}><body>{children}</body></html>;
}
