import type { BillingCycle, Category } from "./subscriptions";

// Catalog of popular subscriptions used to prefill the add form. Prices are
// sensible USD defaults the user can edit. `domain` drives the logo lookup.

export type CatalogEntry = {
  name: string;
  domain: string;
  color: string;
  price: number;
  cycle: BillingCycle;
  category: Category;
};

/**
 * Brand logo for a domain. Uses DuckDuckGo's icon service (full-color, keyed by
 * domain, no API key). <SubLogo> falls back to the monogram if it 404s or fails
 * to load, so swapping this single line changes the source everywhere.
 */
export function logoUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

export const CATALOG: CatalogEntry[] = [
  // Streaming
  { name: "Netflix", domain: "netflix.com", color: "#E50914", price: 15.49, cycle: "monthly", category: "streaming" },
  { name: "Disney+", domain: "disneyplus.com", color: "#113CCF", price: 13.99, cycle: "monthly", category: "streaming" },
  { name: "Max", domain: "max.com", color: "#0046FF", price: 15.99, cycle: "monthly", category: "streaming" },
  { name: "Hulu", domain: "hulu.com", color: "#1CE783", price: 17.99, cycle: "monthly", category: "streaming" },
  { name: "YouTube Premium", domain: "youtube.com", color: "#FF0000", price: 13.99, cycle: "monthly", category: "streaming" },
  { name: "Amazon Prime", domain: "amazon.com", color: "#00A8E1", price: 14.99, cycle: "monthly", category: "streaming" },
  { name: "Apple TV+", domain: "apple.com", color: "#000000", price: 9.99, cycle: "monthly", category: "streaming" },
  { name: "Paramount+", domain: "paramountplus.com", color: "#0064FF", price: 11.99, cycle: "monthly", category: "streaming" },

  // Music
  { name: "Spotify", domain: "spotify.com", color: "#1DB954", price: 11.99, cycle: "monthly", category: "music" },
  { name: "Apple Music", domain: "apple.com", color: "#FA243C", price: 10.99, cycle: "monthly", category: "music" },
  { name: "YouTube Music", domain: "music.youtube.com", color: "#FF0000", price: 10.99, cycle: "monthly", category: "music" },
  { name: "Tidal", domain: "tidal.com", color: "#000000", price: 10.99, cycle: "monthly", category: "music" },

  // Software / productivity
  { name: "ChatGPT Plus", domain: "openai.com", color: "#10A37F", price: 20.0, cycle: "monthly", category: "software" },
  { name: "Claude Pro", domain: "anthropic.com", color: "#D97757", price: 20.0, cycle: "monthly", category: "software" },
  { name: "GitHub Copilot", domain: "github.com", color: "#181717", price: 10.0, cycle: "monthly", category: "software" },
  { name: "Notion", domain: "notion.so", color: "#000000", price: 10.0, cycle: "monthly", category: "software" },
  { name: "Figma", domain: "figma.com", color: "#F24E1E", price: 15.0, cycle: "monthly", category: "software" },
  { name: "Adobe Creative Cloud", domain: "adobe.com", color: "#FF0000", price: 59.99, cycle: "monthly", category: "software" },
  { name: "Microsoft 365", domain: "microsoft.com", color: "#F25022", price: 9.99, cycle: "monthly", category: "software" },
  { name: "Slack", domain: "slack.com", color: "#4A154B", price: 8.75, cycle: "monthly", category: "software" },
  { name: "Canva", domain: "canva.com", color: "#00C4CC", price: 12.99, cycle: "monthly", category: "software" },
  { name: "Grammarly", domain: "grammarly.com", color: "#15C39A", price: 12.0, cycle: "monthly", category: "software" },
  { name: "1Password", domain: "1password.com", color: "#0094F5", price: 2.99, cycle: "monthly", category: "software" },
  { name: "NordVPN", domain: "nordvpn.com", color: "#4687FF", price: 12.99, cycle: "monthly", category: "software" },
  { name: "LinkedIn Premium", domain: "linkedin.com", color: "#0A66C2", price: 39.99, cycle: "monthly", category: "software" },

  // Cloud
  { name: "iCloud+", domain: "apple.com", color: "#3693F3", price: 2.99, cycle: "monthly", category: "cloud" },
  { name: "Google One", domain: "google.com", color: "#4285F4", price: 1.99, cycle: "monthly", category: "cloud" },
  { name: "Dropbox", domain: "dropbox.com", color: "#0061FF", price: 11.99, cycle: "monthly", category: "cloud" },

  // Gaming
  { name: "Xbox Game Pass", domain: "xbox.com", color: "#107C10", price: 16.99, cycle: "monthly", category: "gaming" },
  { name: "PlayStation Plus", domain: "playstation.com", color: "#003791", price: 9.99, cycle: "monthly", category: "gaming" },
  { name: "Nintendo Switch Online", domain: "nintendo.com", color: "#E60012", price: 3.99, cycle: "monthly", category: "gaming" },
  { name: "Twitch", domain: "twitch.tv", color: "#9146FF", price: 8.99, cycle: "monthly", category: "gaming" },

  // News
  { name: "The New York Times", domain: "nytimes.com", color: "#000000", price: 17.0, cycle: "monthly", category: "news" },
  { name: "The Economist", domain: "economist.com", color: "#E3120B", price: 19.99, cycle: "monthly", category: "news" },
  { name: "Medium", domain: "medium.com", color: "#000000", price: 5.0, cycle: "monthly", category: "news" },
  { name: "Audible", domain: "audible.com", color: "#FF9900", price: 14.95, cycle: "monthly", category: "news" },

  // Fitness
  { name: "Strava", domain: "strava.com", color: "#FC4C02", price: 11.99, cycle: "monthly", category: "fitness" },
  { name: "Calm", domain: "calm.com", color: "#2F80ED", price: 14.99, cycle: "monthly", category: "fitness" },
  { name: "Headspace", domain: "headspace.com", color: "#F47D31", price: 12.99, cycle: "monthly", category: "fitness" },
  { name: "Peloton", domain: "onepeloton.com", color: "#000000", price: 12.99, cycle: "monthly", category: "fitness" },

  // Other
  { name: "Duolingo Plus", domain: "duolingo.com", color: "#58CC02", price: 6.99, cycle: "monthly", category: "other" },
  { name: "Patreon", domain: "patreon.com", color: "#FF424D", price: 5.0, cycle: "monthly", category: "other" },
];

/** A short, recognizable set surfaced as one-tap quick-adds on the empty state. */
export const POPULAR_DOMAINS = [
  "Netflix",
  "Spotify",
  "ChatGPT Plus",
  "YouTube Premium",
  "iCloud+",
  "Disney+",
  "Xbox Game Pass",
  "Notion",
] as const;

export const POPULAR: CatalogEntry[] = POPULAR_DOMAINS.map(
  (name) => CATALOG.find((c) => c.name === name)!,
).filter(Boolean);

/** Case-insensitive substring match over the catalog, capped to `limit`. */
export function searchCatalog(query: string, limit = 6): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches = CATALOG.filter((c) => c.name.toLowerCase().includes(q));
  // Prioritize names that start with the query.
  matches.sort((a, b) => {
    const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return as - bs || a.name.localeCompare(b.name);
  });
  return matches.slice(0, limit);
}
