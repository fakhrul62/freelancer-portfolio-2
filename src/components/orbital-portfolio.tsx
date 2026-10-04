"use client";

import { useEffect, useRef, useState } from "react";
import { Earth3D } from "./earth-3d";
import s from "./orbital-portfolio.module.css";

const projects = [
  { name: "Apiro", sub: "Free Icon Picker", type: "A little order in a world of icons.", detail: "Explore, preview and select free icons for web and WordPress design workflows.", href: "https://free-awesome.vercel.app", label: "Explore live site", glyph: "✳", tags: "WEB APPLICATION / DESIGN TOOLS" },
  { name: "BDApi4All", sub: "Bangladesh, connected", type: "Local knowledge. Open endpoints.", detail: "An open-source Bangladesh data API with developer-friendly endpoints for country-specific reference data.", href: "https://github.com/fakhrul62/bdapi4all", label: "View repository", glyph: "⌘", tags: "OPEN SOURCE / REST API" },
  { name: "AI Travel", sub: "Planner", type: "From what if to where next.", detail: "An AI-powered travel dashboard that creates personalised trip plans in a responsive interface.", href: "https://github.com/fakhrul62/travel-ai-dashboard", label: "View repository", glyph: "↗", tags: "AI / TRAVEL DASHBOARD" },
  { name: "CivicDesk", sub: "A clearer way to be heard", type: "Better systems for everyday voices.", detail: "A government complaint management portal for submitting, organising and tracking civic complaints.", href: "https://github.com/fakhrul62/civicdesk", label: "View repository", glyph: "◎", tags: "WEB APPLICATION / CIVIC TECH" },
];

export function OrbitalPortfolio() {
  const root = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const chapters = Array.from(element.querySelectorAll<HTMLElement>("[data-chapter]"));
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("[data-nav]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
      meter.current?.style.setProperty("transform", `scaleX(${progress})`);
      if (readout.current) readout.current.textContent = `${Math.round(progress * 100).toString().padStart(3, "0")}%`;
      let active = 0;
      chapters.forEach((chapter, index) => {
        const bounds = chapter.getBoundingClientRect();
        if (bounds.top < innerHeight * .55) active = index;
        const local = Math.max(-1, Math.min(1, bounds.top / innerHeight));
        chapter.style.setProperty("--drift", reduced.matches || paused ? "0px" : `${local * 65}px`);
      });
      links.forEach((link, index) => {
        if (index === active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { (entry.target as HTMLElement).dataset.visible = "true"; observer.unobserve(entry.target); }
    }), { threshold: .12 });
    element.querySelectorAll("[data-reveal]").forEach(item => observer.observe(item));
    element.dataset.enhanced = "true";
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request);
    reduced.addEventListener("change", request);
    update();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      removeEventListener("scroll", request); removeEventListener("resize", request);
      reduced.removeEventListener("change", request);
    };
  }, [paused]);

  return <div ref={root} className={s.journey} data-paused={paused}>
    <Earth3D paused={paused} />
    <div className={s.atmosphere} aria-hidden="true" />
    <div className={s.grain} aria-hidden="true" />
    <a href="#orbital-content" className="skip-link">Skip to content</a>
    <header className={s.header}>
      <a href="#departure" className={s.identity} aria-label="Fakhrul Alam — back to top"><span className={s.identityMark}>f<span>.</span></span><span>FAKHRUL ALAM<small>DEVELOPER / EARTHLING</small></span></a>
      <a href="#contact" className={s.contactLink}>Let’s make contact <span>↗</span></a>
    </header>
    <nav className={s.navigator} aria-label="Journey chapters">
      {[['departure', 'Departure'], ['signal', 'Philosophy'], ['work', 'Selected work'], ['experience', 'Experience'], ['contact', 'Contact']].map(([id, label], index) => <a key={id} data-nav href={`#${id}`} aria-label={label}><span>0{index + 1}</span><i /><b>{label}</b></a>)}
    </nav>
    <main id="orbital-content" tabIndex={-1} className={s.main}>
      <section id="departure" data-chapter className={s.departure}>
        <div className={s.heroOverline}><span className={s.liveDot} /> A SIGNAL FROM DHAKA, BANGLADESH <span className={s.edition}>PORTFOLIO — VOL. 01</span></div>
        <h1 className={s.heroTitle}><span>Small planet.</span><span className={s.outline}>Big <em>ideas.</em></span></h1>
        <div className={s.earthLabel} aria-hidden="true"><span>ORIGIN / DHAKA</span><i /><small>23.8103° N / 90.4125° E</small></div>
        <div className={s.heroBottom}><div><p className={s.intro}>I’m Fakhrul. I turn complex problems<br />into websites that just <em>work.</em></p><p className={s.disciplines}>WORDPRESS SYSTEMS &nbsp; / &nbsp; FULL-STACK DEVELOPMENT</p></div><a href="#signal" className={s.scrollInvitation}><span>SCROLL TO LEAVE<br />THE ORDINARY</span><b>↓</b></a></div>
        <div className={s.heroFoot}><span>INDEPENDENT MIND. CONNECTED WORLD.</span><span>BUILT WITH CURIOSITY ↗</span></div>
      </section>

      <section id="signal" data-chapter className={s.signal}>
        <div className={s.signalSticky}>
          <p className={s.kicker}>01 / THE HUMAN BEHIND THE SIGNAL</p>
          <h2 data-reveal>Somewhere on<br />this little sphere,<br /><span>someone has<br />a big idea.</span></h2>
          <div className={s.signalCopy} data-reveal><span className={s.cross}>+</span><p>My part is making it real.</p><p>Custom WordPress systems. Full-stack applications. Thoughtful details from the first interaction to the code underneath.</p><p className={s.accentCopy}>Built in Dhaka. Made for the web.</p></div>
          <span className={s.verticalNote}>DISTANCE IS JUST A NUMBER</span>
        </div>
      </section>

      <section id="work" data-chapter className={s.work}>
        <div className={s.sectionHeading} data-reveal><p className={s.kicker}>02 / SELECTED TRANSMISSIONS</p><h2>Ideas with<br /><em>an address.</em></h2><p>A few things I’ve put into the world.<br />Open one. Take a look around.</p></div>
        <div className={s.projectList}>{projects.map((project, index) => <a className={s.project} data-reveal href={project.href} key={project.name} target="_blank" rel="noreferrer">
          <div className={s.projectArt} data-art={index} aria-hidden="true"><div className={s.artGrid} /><span className={s.artOrbit} /><span className={s.artGlyph}>{project.glyph}</span><small>TRANSMISSION_0{index + 1}</small><span className={s.artCoordinates}>↗ &nbsp; 0{index + 1} / 04</span></div>
          <div className={s.projectInfo}><p className={s.projectMeta}>0{index + 1} <span>{project.tags}</span></p><h3>{project.name}<small>{project.sub}</small></h3><p className={s.projectTagline}>{project.type}</p><p className={s.projectDetail}>{project.detail}</p><span className={s.projectCta}>{project.label}<b>↗</b></span></div>
        </a>)}</div>
      </section>

      <section className={s.principles} aria-label="Development principles"><div><span>Less noise.</span><span>More purpose.</span><span className={s.star}>✳</span><span>Better systems.</span></div><p>STRUCTURE / PERFORMANCE / OWNERSHIP</p></section>

      <section id="experience" data-chapter className={s.experience}>
        <div className={s.experienceIntro} data-reveal><p className={s.kicker}>03 / FLIGHT LOG</p><h2>Grounded<br />in <em>the work.</em></h2><p>Across client work, marketing and product teams. Building for the web since 2020.</p><div className={s.coordinateStamp} aria-hidden="true">23°48′37″N<br /><span>90°24′45″E</span><small>HOME BASE / DHAKA</small></div></div>
        <div className={s.log} data-reveal>{[
          ["2025 — PRESENT", "WordPress Developer", "SEO Page1", "Bangladesh"],
          ["2024 — PRESENT", "Technical & Marketing Lead", "EvoltaNova Global", ""],
          ["2024 — 2025", "Lead Developer", "Raw Code Tech", ""],
          ["2020 — 2025", "Full-Stack Web Developer", "Stay Listed Online", "USA"],
        ].map(([date, role, company, place]) => <article key={company}><span className={s.logDot} /><p>{date}</p><h3>{role}</h3><div>{company}<span>{place}</span></div></article>)}</div>
        <div className={s.tools} data-reveal><p className={s.kicker}>THE TOOLKIT / THE STACK FOLLOWS THE PROBLEM</p><p>WordPress <i>·</i> WooCommerce <i>·</i> Webflow <i>·</i> React <i>·</i> Next.js <i>·</i> JavaScript <i>·</i> PHP <i>·</i> Node.js <i>·</i> Express.js <i>·</i> MySQL <i>·</i> MongoDB <i>·</i> REST APIs <i>·</i> Tailwind CSS <i>·</i> Technical SEO</p></div>
      </section>

      <section id="contact" data-chapter className={s.contact}>
        <p className={s.kicker}><span className={s.liveDot} /> THE CHANNEL IS OPEN / AVAILABLE FOR FREELANCE</p>
        <h2 data-reveal>Your next big thing<br />starts with<br /><a href="mailto:fakhrul20.alam@gmail.com"><em>a small hello.</em><span>↗</span></a></h2>
        <a className={s.email} href="mailto:fakhrul20.alam@gmail.com">fakhrul20.alam@gmail.com ↗</a>
        <div className={s.contactBottom}><p>One planet.<br />Endless possibilities.</p><div><a href="https://github.com/fakhrul62/" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/md-fakhrul-alam-shuvo/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="#departure">Back to orbit ↑</a></div></div>
      </section>
    </main>
    <footer className={s.telemetry}><span><i /> DHAKA · EARTH</span><div className={s.progress}><span ref={meter} /></div><span ref={readout}>000%</span><button onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? "Enable ambient motion" : "Pause ambient motion"}>{paused ? "▶" : "Ⅱ"}<span> MOTION {paused ? "OFF" : "ON"}</span></button></footer>
  </div>;
}
