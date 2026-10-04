export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "freelancer-portfolio-2.vercel.app"}`,
);
