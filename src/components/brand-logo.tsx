/**
 * Shared brand logo — mirrors the LogoMark from the landing page.
 * Uses --lp-navy / --lp-accent CSS variables (defined in globals.css for light + dark).
 */

interface BrandLogoProps {
  /** Icon size in px (default 28) */
  size?: number;
  /** Whether to show the "SmartPresence" wordmark next to the mark */
  showName?: boolean;
  /** Font size for the wordmark in px (default size * 0.6) */
  nameFontSize?: number;
}

export function BrandLogo({ size = 28, showName = true, nameFontSize }: BrandLogoProps) {
  const r = Math.round(size * 0.28);
  // 32-unit grid: 5 + 10 + 2 + 10 + 5 → gap = 2, square = 10
  const sq = Math.round(size * 10 / 32);
  const off = Math.round(size * 5 / 32);
  const fontSize = nameFontSize ?? Math.round(size * 0.6);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.32) }}>
      {/* Mark */}
      <span
        style={{
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: r,
          background: "var(--lp-navy)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: off,
            left: off,
            width: sq,
            height: sq,
            background: "var(--lp-accent)",
            borderRadius: 2,
          }}
        />
        <span
          style={{
            position: "absolute",
            top: off,
            right: off,
            width: sq,
            height: sq,
            background: "#fff",
            borderRadius: 2,
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: off,
            left: off,
            width: sq,
            height: sq,
            background: "#fff",
            borderRadius: 2,
          }}
        />
      </span>

      {/* Wordmark */}
      {showName && (
        <span
          style={{
            fontSize,
            fontWeight: 600,
            letterSpacing: -0.2,
            color: "currentColor",
            whiteSpace: "nowrap",
          }}
        >
          SmartPresence
        </span>
      )}
    </span>
  );
}
