import Head from "next/head";
import CategoryBadges from "./CategoryBadges";
import Portrait from "./Portrait";
import DayDial from "./DayDial";

export default function DesignerPage({ designer, allDesigners }) {
  return (
    <div className="page">
      <Head>
        <title>{designer.name} · GRAPHICAL</title>
        <meta
          name="description"
          content={`${designer.name} — featured on their birthday as part of GRAPHICAL, a daily calendar of graphic designers.`}
        />
      </Head>

      <h1 className="name-heading">{designer.name}</h1>

      <CategoryBadges activeCode={designer.categoryCode} />

      <div className="hero-visual">
        <div className="watermark left" aria-hidden="true">
          <img src="/graphical-mark.svg" alt="" />
        </div>
        <div className="watermark right" aria-hidden="true">
          <img src="/graphical-mark.svg" alt="" />
        </div>

        <Portrait slug={designer.slug} name={designer.name} />

        {(designer.links?.profile || designer.links?.portfolio) && (
          <div className="button-row">
            {designer.links?.profile && (
              <a
                className="pill-button"
                href={designer.links.profile}
                target="_blank"
                rel="noopener noreferrer"
              >
                Profile
              </a>
            )}
            {designer.links?.portfolio && (
              <a
                className="pill-button"
                href={designer.links.portfolio}
                target="_blank"
                rel="noopener noreferrer"
              >
                Portfolio
              </a>
            )}
          </div>
        )}
        {designer.links?.circle && (
          <div className="button-row button-row-solo">
            <a
              className="pill-button"
              href={designer.links.circle}
              target="_blank"
              rel="noopener noreferrer"
            >
              Circle
            </a>
          </div>
        )}
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
