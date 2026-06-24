import { OutlayLogo } from "./OutlayLogo";

/**
 * Thin compatibility wrapper around the brand {@link OutlayLogo}. Keeps the
 * existing `tone` API so every call site (nav, footer, auth, dashboard) renders
 * the real pulse-mark logo. `tone="paper"` is for dark backgrounds.
 */
export default function Wordmark({
  className = "",
  tone = "navy",
  size = 30,
  showWordmark = true,
}: {
  className?: string;
  tone?: "navy" | "paper";
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <OutlayLogo
      size={size}
      variant={tone === "paper" ? "onDark" : "onLight"}
      showWordmark={showWordmark}
      className={className}
    />
  );
}
