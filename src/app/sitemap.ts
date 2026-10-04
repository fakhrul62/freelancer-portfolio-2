import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL("/", siteUrl).href, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: new URL("/home-2", siteUrl).href, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
