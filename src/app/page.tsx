import type { Metadata } from "next";
import { connection } from "next/server";
import { OrbitalPortfolio } from "@/components/orbital-portfolio";

export const metadata: Metadata = {
  title: "A signal from Dhaka — Fakhrul Alam",
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "A signal from Dhaka — Fakhrul Alam" },
};

export default async function Home() {
  await connection();
  return <OrbitalPortfolio />;
}
