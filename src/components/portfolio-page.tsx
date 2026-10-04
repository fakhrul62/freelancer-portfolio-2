import type { ReactNode } from "react";
import { connection } from "next/server";
import { headers } from "next/headers";

const projects = [
  { title: "Apiro Free Icon Picker", detail: "A searchable web application for exploring, previewing and selecting free icons for web and WordPress design workflows.", href: "https://free-awesome.vercel.app", label: "Live site" },
  { title: "BDApi4All", detail: "An open-source Bangladesh data API with developer-friendly endpoints for country-specific reference data.", href: "https://github.com/fakhrul62/bdapi4all", label: "GitHub" },
  { title: "AI Travel Planner", detail: "An AI-powered travel dashboard that creates personalised trip plans and presents itineraries in a responsive interface.", href: "https://github.com/fakhrul62/travel-ai-dashboard", label: "GitHub" },
  { title: "CivicDesk", detail: "A government complaint management portal for submitting, organising and tracking civic complaints through citizen and administrative workflows.", href: "https://github.com/fakhrul62/civicdesk", label: "GitHub" },
];

export async function PortfolioPage({ background, credits }: { background: ReactNode; credits?: ReactNode }) {
  await connection();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Md. Fakhrul Alam Shuvo",
    jobTitle: "WordPress & Full-Stack Web Developer",
    email: "mailto:fakhrul20.alam@gmail.com",
    address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "Bangladesh" },
    sameAs: ["https://github.com/fakhrul62/", "https://www.linkedin.com/in/md-fakhrul-alam-shuvo/", "https://fakhrul.codechronic.com/"],
  };
  return (
    <>
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
      {background}
      <div className="veil" aria-hidden="true" />
      <a className="skip-link" href="#content">Skip to content</a>
      <header className="masthead"><a href="#top">Fakhrul Alam</a><nav aria-label="Primary"><a href="#work">Work</a><a href="#experience">Experience</a><a href="#contact">Contact</a></nav></header>
      <main id="content" tabIndex={-1}>
        <section className="hero" id="top">
          <p className="eyebrow"><span className="status-dot" aria-hidden="true" />Available in Dhaka, Bangladesh</p>
          <h1>WordPress and web systems<br />built to stay fast.</h1>
          <p className="hero-copy">I build custom WordPress systems and full-stack web applications with a focus on performance, technical SEO and work that stays maintainable after launch.</p>
          <p className="hero-meta">WORDPRESS SYSTEMS&nbsp;&nbsp;·&nbsp;&nbsp;FULL-STACK APPLICATIONS&nbsp;&nbsp;·&nbsp;&nbsp;BUILDING SINCE 2020</p>
          <a className="text-link" href="#work">Explore selected work <span aria-hidden="true">↓</span></a>
        </section>

        <section className="work" id="work" aria-labelledby="work-title">
          <div className="section-head"><p className="index">01 / Selected work</p><h2 id="work-title">Systems in public.</h2></div>
          <ol className="project-list">{projects.map((project, index) => <li key={project.title}><span className="project-number">0{index + 1}</span><div><h3>{project.title}</h3><p>{project.detail}</p></div><a href={project.href} target="_blank" rel="noreferrer">{project.label}<span aria-hidden="true"> ↗</span></a></li>)}</ol>
        </section>

        <section className="statement" aria-labelledby="approach-title">
          <p className="index">02 / Approach</p>
          <div><h2 id="approach-title">Structure. Performance. Ownership.</h2><p>WordPress as a system, not a page builder: clean themes, templates and hooks. Faster load times with less JavaScript. Code that another developer can understand and continue.</p></div>
        </section>

        <section className="experience" id="experience" aria-labelledby="experience-title">
          <p className="index">03 / Experience</p><div><h2 id="experience-title">Built across client work, marketing and product teams.</h2><dl><div><dt>WordPress Developer</dt><dd>SEO Page1, Bangladesh · 2025—present</dd></div><div><dt>Technical & Marketing Lead</dt><dd>EvoltaNova Global · 2024—present</dd></div><div><dt>Lead Developer</dt><dd>Raw Code Tech · 2024—2025</dd></div><div><dt>Full-Stack Web Developer</dt><dd>Stay Listed Online, USA · 2020—2025</dd></div></dl></div>
        </section>

        <section className="tools" aria-labelledby="tools-title"><p className="index">04 / Tools</p><div><h2 id="tools-title">The stack follows the problem.</h2><p>WordPress · WooCommerce · Webflow · React · Next.js · JavaScript · PHP · Node.js · Express.js · MySQL · MongoDB · REST APIs · Tailwind CSS · technical SEO</p></div></section>

        <section className="contact" id="contact" aria-labelledby="contact-title"><p className="eyebrow">Available for freelance</p><h2 id="contact-title">Let&apos;s talk about<br />your project.</h2><a href="mailto:fakhrul20.alam@gmail.com">fakhrul20.alam@gmail.com <span aria-hidden="true">↗</span></a><div className="socials"><a href="https://github.com/fakhrul62/" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/md-fakhrul-alam-shuvo/" target="_blank" rel="noreferrer">LinkedIn</a></div></section>
      </main>
      {credits}
    </>
  );
}
