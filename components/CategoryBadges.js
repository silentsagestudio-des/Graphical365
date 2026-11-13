import { CATEGORY_ORDER } from "../data/categories";

function splitCode(code) {
  // "I&C" -> ["I", "&C"], "D&P" -> ["D", "&P"], etc.
  const i = code.indexOf("&");
  return [code.slice(0, i), code.slice(i)];
}

// Rounded-corner triangle, apex up, drawn in a 0-100 viewBox. CSS clip-path
// can make a sharp-cornered triangle, but it clips away any border on the
// diagonal edges, so the curved corners from the reference design are drawn
// as a real stroked SVG path instead.
const TRIANGLE_PATH =
  "M17.15 73.7 L42.85 22.3 Q50 8 57.15 22.3 L82.85 73.7 Q90 88 74 88 L26 88 Q10 88 17.15 73.7 Z";

export default function CategoryBadges({ activeCode }) {
  return (
    <div className="badge-row">
      {CATEGORY_ORDER.map((cat) => {
        const [top, bottom] = splitCode(cat.code);
        const isActive = cat.code === activeCode;
        return (
          <div className="badge-col" key={cat.code}>
            <div
              className={`badge${isActive ? " active" : ""}`}
              title={cat.label}
            >
              <svg
                className="badge-shape"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <path d={TRIANGLE_PATH} />
              </svg>
              <div className="badge-label">
                <span>{top}</span>
                <span>{bottom}</span>
              </div>
            </div>
            {isActive && <div className="badge-caption">{cat.label}</div>}
          </div>
        );
      })}
    </div>
  );
}
