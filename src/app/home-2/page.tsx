import type { Metadata } from "next";
import { EarthSequence } from "@/components/earth-sequence";
import { PortfolioPage } from "@/components/portfolio-page";

export const metadata: Metadata = {
  title: "Md. Fakhrul Alam Shuvo — WordPress & Full-Stack Web Developer",
  alternates: { canonical: "/home-2" },
  openGraph: { url: "/home-2" },
};

export default function HomeTwo() {
  return <PortfolioPage background={<div className="earth"><EarthSequence /></div>} />;
}
