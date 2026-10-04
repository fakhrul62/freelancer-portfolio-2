import type { Metadata } from "next";
import { OrbitalPortfolio } from "@/components/orbital-portfolio";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "A signal from Dhaka — Fakhrul Alam",
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "A signal from Dhaka — Fakhrul Alam" },
};

export default async function EarthPage() {
  await connection();
  return <OrbitalPortfolio />;
}
