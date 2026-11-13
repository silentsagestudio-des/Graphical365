import { useEffect, useRef, Fragment } from "react";
import Head from "next/head";
import CategoryBadges from "./CategoryBadges";
import Portrait from "./Portrait";
import DayDial from "./DayDial";
import { getMonthTheme } from "../lib/monthColors";

// Google-search fallback for the Profile/Portfolio/Circle buttons on the 361
// designers who don't yet have real links on file, so the buttons are always
// present between the illustration and the dial (never a dead "#" link).
function searchFallback(name, suffix) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${name} ${suffix}`)}`;
}

// Two words or fewer stay on one line. More than two words break after the
// second word onto a second line (the .name-heading box is sized for
// exactly two lines either way, so this never shifts the layout below it).
// Each line is wrapped in its own span so the fit-to-container effect below
// can measure line widths individually.
function NameHeading({ name, nameLinesRef }) {
  const words = name.trim().split(/\s+/);
  const lines =
    words.length <= 2 ? [name] : [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
  return (
    <span className="name-lines" ref={nameLinesRef}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          <span className="name-line">{line}</span>
        </Fragment>
      ))}
    </span>
  );
}

export default function DesignerPage({ designer, allDesigners }) {
  const theme = getMonthTheme(designer.month);
  const nameHeadingRef = useRef(null);
  const nameLinesRef = useRef(null);

  // Keeps the body background matching the current month's theme too, so
  // there's no mismatched sliver behind .page during overscroll/bounce.
  useEffect(() => {
    document.body.style.background = theme.pink;
    return () => {
      document.body.style.background = "";
    };
  }, [theme.pink]);

  // Safety net for the handful of exceptionally long names (unsplittable
  // 2-word hyphenated surnames, mostly) that would otherwise overflow the
  // name-heading's 2x font size. Measures the widest rendered line against
  // the available container width and, only if it overflows, shrinks the
  // font-size on .name-lines specifically -- never on .name-heading itself,
  // so the reserved two-line-height box above never changes size.
  useEffect(() => {
    const wrap = nameLinesRef.current;
    const container = nameHeadingRef.current;
    if (!wrap || !container) return;

    function fit() {
      wrap.style.fontSize = "";
      const lines = wrap.querySelectorAll(".name-line");
      let maxWidth = 0;
      lines.forEach((line) => {
        maxWidth = Math.max(maxWidth, line.scrollWidth);
      });
      const available = container.clientWidth;
      if (maxWidth > available && maxWidth > 0) {
        const base = parseFloat(getComputedStyle(wrap).fontSize);
        const scale = (available / maxWidth) * 0.96;
        wrap.style.fontSize = `${base * scale}px`;
      }
    }

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [designer.name]);

  const profileHref = designer.links?.profile || searchFallback(designer.name, "designer profile");
  const portfolioHref = designer.links?.portfolio || searchFallback(designer.name, "design portfolio");

  return (
    <div
      className="page"
      style={{ "--pink": theme.pink, "--badge-outline": theme.badgeOutline }}
    >
      <Head>
        <title>{designer.name} · GRAPHICAL</title>
        <meta
          name="description"
          content={`${designer.name} — featured on their birthday as part of GRAPHICAL, a daily calendar of graphic designers.`}
        />
      </Head>

      <h1 className="name-heading" ref={nameHeadingRef}>
        <NameHeading name={designer.name} nameLinesRef={nameLinesRef} />
      </h1>

      <CategoryBadges activeCode={designer.categoryCode} />

      <div className="hero-visual">
        <div className="watermark left" aria-hidden="true">
          <img src="/graphical-mark-left.svg" alt="" />
        </div>
        <div className="watermark right" aria-hidden="true">
          <img src="/graphical-mark-right.svg" alt="" />
        </div>

        <Portrait slug={designer.slug} name={designer.name} />

        <div className="button-row">
          <a
            className="pill-button"
            href={profileHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Profile
          </a>
          <a
            className="pill-button"
            href={portfolioHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Portfolio
          </a>
        </div>
      </div>

      <DayDial designers={allDesigners} current={designer} />

      <footer className="footer">
        <p className="tagline">GRAPHICAL</p>
        <p>
          Every day of the year marks a designer&rsquo;s birthday. GRAPHICAL
          puts a face, a name, and a body of work to each one.
        </p>
        <p className="follow">
          Follow:{" "}
          <a href="#" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>{" "}
          · See our work:{" "}
          <a href="#" target="_blank" rel="noopener noreferrer">
            Behance
          </a>{" "}
          /{" "}
          <a href="#" target="_blank" rel="noopener noreferrer">
            Dribbble
          </a>
        </p>
        <p className="story">
          GRAPHICAL started the day I graduated in 2016, knowing my design
          education was incomplete but knowing how to fill the gaps. In the
          age of AI and information, this felt like the right year to finally
          build it. What began as a daily Instagram project, then a Chrome
          extension, is now this calendar — an attempt to bring 365 design
          personalities closer to our everyday lives. It keeps shaping how I
          grow, and I hope it does the same for you.
        </p>
        <p className="signature">A project by Silent Sage Studio</p>
      </footer>
    </div>
  );
}
