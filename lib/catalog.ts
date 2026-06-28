import type { BillingCycle, Category } from "./subscriptions";
import { convertFromUsd, type CurrencyCode } from "./currency";

// Catalog of popular subscriptions used to prefill the add form. Prices are
// sensible defaults the user can edit, and tiers are split out (e.g. Claude
// Pro vs Max, Netflix Standard vs Premium) so picking the exact plan is one tap.
// `domain` drives the logo lookup; tiers of one brand share a domain.
//
// `price` is the USD baseline. `priceCzk` is the real local Czech price where
// known (see `CZK_PRICES`); otherwise we fall back to converting USD so every
// service still resolves a CZK figure.

export type CatalogEntry = {
  name: string;
  domain: string;
  color: string;
  price: number;
  /** Real local CZK price when known; falls back to a converted value. */
  priceCzk?: number;
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

// Tier/plan words stripped when guessing a brand domain, so "YouTube Premium"
// resolves to youtube.com rather than youtubepremium.com.
const TIER_WORDS = new Set([
  "plus", "premium", "pro", "max", "basic", "standard", "ultimate", "ultra",
  "individual", "family", "duo", "student", "personal", "business", "starter",
  "essential", "lite", "advanced", "plan", "membership", "subscription",
  "monthly", "yearly", "annual", "the", "app",
]);

/**
 * Best-effort brand domain for a free-typed name, so custom subscriptions still
 * get a real logo. Strips tier words and punctuation, joins what's left, and
 * appends `.com`. <SubLogo> falls back to the monogram if the guess 404s, so a
 * wrong guess is harmless.
 */
export function guessDomain(name: string): string {
  const tokens = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !TIER_WORDS.has(t));
  const slug = (tokens.length ? tokens : [name.toLowerCase().replace(/[^a-z0-9]/g, "")]).join("");
  return slug ? `${slug}.com` : "";
}

/** Logo URL for a free-typed name, or undefined when nothing usable remains. */
export function guessLogoUrl(name: string): string | undefined {
  const domain = guessDomain(name);
  return domain ? logoUrl(domain) : undefined;
}

export const CATALOG: CatalogEntry[] = [
  // ── Streaming ──────────────────────────────────────────────────────────────
  { name: "Netflix Standard with ads", domain: "netflix.com", color: "#E50914", price: 7.99, cycle: "monthly", category: "streaming" },
  { name: "Netflix Standard", domain: "netflix.com", color: "#E50914", price: 17.99, cycle: "monthly", category: "streaming" },
  { name: "Netflix Premium", domain: "netflix.com", color: "#E50914", price: 24.99, cycle: "monthly", category: "streaming" },
  { name: "Disney+ Basic", domain: "disneyplus.com", color: "#113CCF", price: 9.99, cycle: "monthly", category: "streaming" },
  { name: "Disney+ Premium", domain: "disneyplus.com", color: "#113CCF", price: 15.99, cycle: "monthly", category: "streaming" },
  { name: "Max Ad-Lite", domain: "max.com", color: "#0046FF", price: 9.99, cycle: "monthly", category: "streaming" },
  { name: "Max Ad-Free", domain: "max.com", color: "#0046FF", price: 16.99, cycle: "monthly", category: "streaming" },
  { name: "Max Ultimate", domain: "max.com", color: "#0046FF", price: 20.99, cycle: "monthly", category: "streaming" },
  { name: "Hulu (With Ads)", domain: "hulu.com", color: "#1CE783", price: 9.99, cycle: "monthly", category: "streaming" },
  { name: "Hulu (No Ads)", domain: "hulu.com", color: "#1CE783", price: 18.99, cycle: "monthly", category: "streaming" },
  { name: "YouTube Premium", domain: "youtube.com", color: "#FF0000", price: 13.99, cycle: "monthly", category: "streaming" },
  { name: "YouTube TV", domain: "youtube.com", color: "#FF0000", price: 82.99, cycle: "monthly", category: "streaming" },
  { name: "Amazon Prime", domain: "amazon.com", color: "#00A8E1", price: 14.99, cycle: "monthly", category: "streaming" },
  { name: "Apple TV+", domain: "apple.com", color: "#000000", price: 9.99, cycle: "monthly", category: "streaming" },
  { name: "Paramount+ Essential", domain: "paramountplus.com", color: "#0064FF", price: 7.99, cycle: "monthly", category: "streaming" },
  { name: "Paramount+ with Showtime", domain: "paramountplus.com", color: "#0064FF", price: 12.99, cycle: "monthly", category: "streaming" },
  { name: "Peacock Premium", domain: "peacocktv.com", color: "#000000", price: 7.99, cycle: "monthly", category: "streaming" },
  { name: "Peacock Premium Plus", domain: "peacocktv.com", color: "#000000", price: 13.99, cycle: "monthly", category: "streaming" },
  { name: "Crunchyroll", domain: "crunchyroll.com", color: "#F47521", price: 7.99, cycle: "monthly", category: "streaming" },
  { name: "ESPN+", domain: "espn.com", color: "#FF0000", price: 11.99, cycle: "monthly", category: "streaming" },
  { name: "MUBI", domain: "mubi.com", color: "#000000", price: 14.99, cycle: "monthly", category: "streaming" },

  // ── Music ──────────────────────────────────────────────────────────────────
  { name: "Spotify Premium", domain: "spotify.com", color: "#1DB954", price: 11.99, cycle: "monthly", category: "music" },
  { name: "Spotify Duo", domain: "spotify.com", color: "#1DB954", price: 16.99, cycle: "monthly", category: "music" },
  { name: "Spotify Family", domain: "spotify.com", color: "#1DB954", price: 19.99, cycle: "monthly", category: "music" },
  { name: "Spotify Student", domain: "spotify.com", color: "#1DB954", price: 5.99, cycle: "monthly", category: "music" },
  { name: "Apple Music", domain: "apple.com", color: "#FA243C", price: 10.99, cycle: "monthly", category: "music" },
  { name: "Apple Music Family", domain: "apple.com", color: "#FA243C", price: 16.99, cycle: "monthly", category: "music" },
  { name: "YouTube Music", domain: "music.youtube.com", color: "#FF0000", price: 10.99, cycle: "monthly", category: "music" },
  { name: "Tidal", domain: "tidal.com", color: "#000000", price: 10.99, cycle: "monthly", category: "music" },
  { name: "Amazon Music Unlimited", domain: "amazon.com", color: "#00A8E1", price: 10.99, cycle: "monthly", category: "music" },
  { name: "Deezer", domain: "deezer.com", color: "#A238FF", price: 11.99, cycle: "monthly", category: "music" },
  { name: "SoundCloud Go+", domain: "soundcloud.com", color: "#FF5500", price: 9.99, cycle: "monthly", category: "music" },
  { name: "Pandora Premium", domain: "pandora.com", color: "#3668FF", price: 10.99, cycle: "monthly", category: "music" },

  // ── AI ─────────────────────────────────────────────────────────────────────
  { name: "Claude Pro", domain: "anthropic.com", color: "#D97757", price: 20.0, cycle: "monthly", category: "software" },
  { name: "Claude Max (5×)", domain: "anthropic.com", color: "#D97757", price: 100.0, cycle: "monthly", category: "software" },
  { name: "Claude Max (20×)", domain: "anthropic.com", color: "#D97757", price: 200.0, cycle: "monthly", category: "software" },
  { name: "ChatGPT Plus", domain: "openai.com", color: "#10A37F", price: 20.0, cycle: "monthly", category: "software" },
  { name: "ChatGPT Pro", domain: "openai.com", color: "#10A37F", price: 200.0, cycle: "monthly", category: "software" },
  { name: "Google AI Pro", domain: "gemini.google.com", color: "#4285F4", price: 19.99, cycle: "monthly", category: "software" },
  { name: "Google AI Ultra", domain: "gemini.google.com", color: "#4285F4", price: 249.99, cycle: "monthly", category: "software" },
  { name: "Perplexity Pro", domain: "perplexity.ai", color: "#20808D", price: 20.0, cycle: "monthly", category: "software" },
  { name: "Perplexity Max", domain: "perplexity.ai", color: "#20808D", price: 200.0, cycle: "monthly", category: "software" },
  { name: "Midjourney Basic", domain: "midjourney.com", color: "#000000", price: 10.0, cycle: "monthly", category: "software" },
  { name: "Midjourney Standard", domain: "midjourney.com", color: "#000000", price: 30.0, cycle: "monthly", category: "software" },
  { name: "Midjourney Pro", domain: "midjourney.com", color: "#000000", price: 60.0, cycle: "monthly", category: "software" },
  { name: "ElevenLabs Starter", domain: "elevenlabs.io", color: "#000000", price: 5.0, cycle: "monthly", category: "software" },

  // ── Developer tools ─────────────────────────────────────────────────────────
  { name: "GitHub Copilot Pro", domain: "github.com", color: "#181717", price: 10.0, cycle: "monthly", category: "software" },
  { name: "GitHub Copilot Pro+", domain: "github.com", color: "#181717", price: 39.0, cycle: "monthly", category: "software" },
  { name: "GitHub Pro", domain: "github.com", color: "#181717", price: 4.0, cycle: "monthly", category: "software" },
  { name: "Cursor Pro", domain: "cursor.com", color: "#000000", price: 20.0, cycle: "monthly", category: "software" },
  { name: "Cursor Ultra", domain: "cursor.com", color: "#000000", price: 200.0, cycle: "monthly", category: "software" },
  { name: "Vercel Pro", domain: "vercel.com", color: "#000000", price: 20.0, cycle: "monthly", category: "software" },
  { name: "JetBrains All Products Pack", domain: "jetbrains.com", color: "#000000", price: 28.9, cycle: "monthly", category: "software" },
  { name: "Linear", domain: "linear.app", color: "#5E6AD2", price: 8.0, cycle: "monthly", category: "software" },

  // ── Software / productivity ─────────────────────────────────────────────────
  { name: "Notion Plus", domain: "notion.so", color: "#000000", price: 10.0, cycle: "monthly", category: "software" },
  { name: "Notion Business", domain: "notion.so", color: "#000000", price: 15.0, cycle: "monthly", category: "software" },
  { name: "Figma Professional", domain: "figma.com", color: "#F24E1E", price: 15.0, cycle: "monthly", category: "software" },
  { name: "Adobe Creative Cloud All Apps", domain: "adobe.com", color: "#FF0000", price: 59.99, cycle: "monthly", category: "software" },
  { name: "Adobe Photography Plan", domain: "adobe.com", color: "#FF0000", price: 9.99, cycle: "monthly", category: "software" },
  { name: "Microsoft 365 Personal", domain: "microsoft.com", color: "#F25022", price: 9.99, cycle: "monthly", category: "software" },
  { name: "Microsoft 365 Family", domain: "microsoft.com", color: "#F25022", price: 12.99, cycle: "monthly", category: "software" },
  { name: "Slack Pro", domain: "slack.com", color: "#4A154B", price: 8.75, cycle: "monthly", category: "software" },
  { name: "Zoom Pro", domain: "zoom.us", color: "#0B5CFF", price: 13.33, cycle: "monthly", category: "software" },
  { name: "Canva Pro", domain: "canva.com", color: "#00C4CC", price: 12.99, cycle: "monthly", category: "software" },
  { name: "Grammarly Premium", domain: "grammarly.com", color: "#15C39A", price: 12.0, cycle: "monthly", category: "software" },
  { name: "Todoist Pro", domain: "todoist.com", color: "#E44332", price: 4.0, cycle: "monthly", category: "software" },
  { name: "Asana Starter", domain: "asana.com", color: "#F06A6A", price: 10.99, cycle: "monthly", category: "software" },
  { name: "Trello Premium", domain: "trello.com", color: "#0079BF", price: 10.0, cycle: "monthly", category: "software" },
  { name: "Squarespace Personal", domain: "squarespace.com", color: "#000000", price: 16.0, cycle: "monthly", category: "software" },
  { name: "1Password", domain: "1password.com", color: "#0094F5", price: 2.99, cycle: "monthly", category: "software" },
  { name: "1Password Families", domain: "1password.com", color: "#0094F5", price: 4.99, cycle: "monthly", category: "software" },
  { name: "Dashlane Premium", domain: "dashlane.com", color: "#0E353D", price: 4.99, cycle: "monthly", category: "software" },
  { name: "NordVPN", domain: "nordvpn.com", color: "#4687FF", price: 12.99, cycle: "monthly", category: "software" },
  { name: "ExpressVPN", domain: "expressvpn.com", color: "#DA3940", price: 12.95, cycle: "monthly", category: "software" },
  { name: "Surfshark", domain: "surfshark.com", color: "#178A7C", price: 15.45, cycle: "monthly", category: "software" },
  { name: "Proton VPN Plus", domain: "protonvpn.com", color: "#6D4AFF", price: 9.99, cycle: "monthly", category: "software" },
  { name: "Proton Unlimited", domain: "proton.me", color: "#6D4AFF", price: 12.99, cycle: "monthly", category: "software" },
  { name: "LinkedIn Premium Career", domain: "linkedin.com", color: "#0A66C2", price: 39.99, cycle: "monthly", category: "software" },

  // ── Cloud / storage ─────────────────────────────────────────────────────────
  { name: "iCloud+ 50GB", domain: "apple.com", color: "#3693F3", price: 0.99, cycle: "monthly", category: "cloud" },
  { name: "iCloud+ 200GB", domain: "apple.com", color: "#3693F3", price: 2.99, cycle: "monthly", category: "cloud" },
  { name: "iCloud+ 2TB", domain: "apple.com", color: "#3693F3", price: 9.99, cycle: "monthly", category: "cloud" },
  { name: "Google One 100GB", domain: "google.com", color: "#4285F4", price: 1.99, cycle: "monthly", category: "cloud" },
  { name: "Google One 2TB", domain: "google.com", color: "#4285F4", price: 9.99, cycle: "monthly", category: "cloud" },
  { name: "Dropbox Plus", domain: "dropbox.com", color: "#0061FF", price: 11.99, cycle: "monthly", category: "cloud" },
  { name: "Dropbox Family", domain: "dropbox.com", color: "#0061FF", price: 19.99, cycle: "monthly", category: "cloud" },
  { name: "Backblaze", domain: "backblaze.com", color: "#E21E29", price: 9.0, cycle: "monthly", category: "cloud" },

  // ── Gaming ──────────────────────────────────────────────────────────────────
  { name: "Xbox Game Pass Ultimate", domain: "xbox.com", color: "#107C10", price: 19.99, cycle: "monthly", category: "gaming" },
  { name: "PC Game Pass", domain: "xbox.com", color: "#107C10", price: 11.99, cycle: "monthly", category: "gaming" },
  { name: "PlayStation Plus Essential", domain: "playstation.com", color: "#003791", price: 9.99, cycle: "monthly", category: "gaming" },
  { name: "PlayStation Plus Extra", domain: "playstation.com", color: "#003791", price: 14.99, cycle: "monthly", category: "gaming" },
  { name: "PlayStation Plus Premium", domain: "playstation.com", color: "#003791", price: 17.99, cycle: "monthly", category: "gaming" },
  { name: "Nintendo Switch Online", domain: "nintendo.com", color: "#E60012", price: 19.99, cycle: "yearly", category: "gaming" },
  { name: "Nintendo Switch Online + Expansion", domain: "nintendo.com", color: "#E60012", price: 49.99, cycle: "yearly", category: "gaming" },
  { name: "EA Play", domain: "ea.com", color: "#FF4747", price: 5.99, cycle: "monthly", category: "gaming" },
  { name: "Ubisoft+", domain: "ubisoft.com", color: "#000000", price: 17.99, cycle: "monthly", category: "gaming" },
  { name: "GeForce Now Ultimate", domain: "nvidia.com", color: "#76B900", price: 19.99, cycle: "monthly", category: "gaming" },
  { name: "Apple Arcade", domain: "apple.com", color: "#000000", price: 6.99, cycle: "monthly", category: "gaming" },
  { name: "Discord Nitro", domain: "discord.com", color: "#5865F2", price: 9.99, cycle: "monthly", category: "gaming" },
  { name: "Twitch Turbo", domain: "twitch.tv", color: "#9146FF", price: 11.99, cycle: "monthly", category: "gaming" },

  // ── News / reading ──────────────────────────────────────────────────────────
  { name: "The New York Times", domain: "nytimes.com", color: "#000000", price: 25.0, cycle: "monthly", category: "news" },
  { name: "The Wall Street Journal", domain: "wsj.com", color: "#000000", price: 38.99, cycle: "monthly", category: "news" },
  { name: "The Washington Post", domain: "washingtonpost.com", color: "#000000", price: 12.0, cycle: "monthly", category: "news" },
  { name: "The Economist", domain: "economist.com", color: "#E3120B", price: 19.99, cycle: "monthly", category: "news" },
  { name: "Bloomberg", domain: "bloomberg.com", color: "#000000", price: 34.99, cycle: "monthly", category: "news" },
  { name: "Financial Times", domain: "ft.com", color: "#FFF1E5", price: 39.0, cycle: "monthly", category: "news" },
  { name: "The Athletic", domain: "theathletic.com", color: "#000000", price: 7.99, cycle: "monthly", category: "news" },
  { name: "Medium", domain: "medium.com", color: "#000000", price: 5.0, cycle: "monthly", category: "news" },
  { name: "Audible", domain: "audible.com", color: "#FF9900", price: 14.95, cycle: "monthly", category: "news" },
  { name: "Kindle Unlimited", domain: "amazon.com", color: "#00A8E1", price: 11.99, cycle: "monthly", category: "news" },
  { name: "Blinkist", domain: "blinkist.com", color: "#00D87D", price: 15.99, cycle: "monthly", category: "news" },

  // ── Fitness / wellness ──────────────────────────────────────────────────────
  { name: "Strava", domain: "strava.com", color: "#FC4C02", price: 11.99, cycle: "monthly", category: "fitness" },
  { name: "Calm", domain: "calm.com", color: "#2F80ED", price: 14.99, cycle: "monthly", category: "fitness" },
  { name: "Headspace", domain: "headspace.com", color: "#F47D31", price: 12.99, cycle: "monthly", category: "fitness" },
  { name: "Apple Fitness+", domain: "apple.com", color: "#000000", price: 9.99, cycle: "monthly", category: "fitness" },
  { name: "Peloton App", domain: "onepeloton.com", color: "#000000", price: 12.99, cycle: "monthly", category: "fitness" },
  { name: "Peloton All-Access", domain: "onepeloton.com", color: "#000000", price: 44.0, cycle: "monthly", category: "fitness" },
  { name: "MyFitnessPal Premium", domain: "myfitnesspal.com", color: "#0070EB", price: 19.99, cycle: "monthly", category: "fitness" },
  { name: "Fitbit Premium", domain: "fitbit.com", color: "#00B0B9", price: 9.99, cycle: "monthly", category: "fitness" },
  { name: "WHOOP", domain: "whoop.com", color: "#000000", price: 30.0, cycle: "monthly", category: "fitness" },
  { name: "ClassPass", domain: "classpass.com", color: "#000000", price: 49.0, cycle: "monthly", category: "fitness" },

  // ── Other ───────────────────────────────────────────────────────────────────
  { name: "Duolingo Super", domain: "duolingo.com", color: "#58CC02", price: 6.99, cycle: "monthly", category: "other" },
  { name: "Duolingo Max", domain: "duolingo.com", color: "#58CC02", price: 30.0, cycle: "monthly", category: "other" },
  { name: "Babbel", domain: "babbel.com", color: "#FF9600", price: 17.95, cycle: "monthly", category: "other" },
  { name: "Patreon", domain: "patreon.com", color: "#FF424D", price: 5.0, cycle: "monthly", category: "other" },
  { name: "DoorDash DashPass", domain: "doordash.com", color: "#FF3008", price: 9.99, cycle: "monthly", category: "other" },
  { name: "Uber One", domain: "uber.com", color: "#000000", price: 9.99, cycle: "monthly", category: "other" },
  { name: "Instacart+", domain: "instacart.com", color: "#0AAD0A", price: 9.99, cycle: "monthly", category: "other" },
  { name: "Walmart+", domain: "walmart.com", color: "#0071DC", price: 12.95, cycle: "monthly", category: "other" },
  { name: "Costco", domain: "costco.com", color: "#005DAA", price: 65.0, cycle: "yearly", category: "other" },

  // ── Finance / fintech ───────────────────────────────────────────────────────
  { name: "Revolut Plus", domain: "revolut.com", color: "#0666EB", price: 3.99, cycle: "monthly", category: "finance" },
  { name: "Revolut Premium", domain: "revolut.com", color: "#0666EB", price: 8.99, cycle: "monthly", category: "finance" },
  { name: "Revolut Metal", domain: "revolut.com", color: "#0666EB", price: 16.99, cycle: "monthly", category: "finance" },
  { name: "Revolut Ultra", domain: "revolut.com", color: "#0666EB", price: 45.0, cycle: "monthly", category: "finance" },
  { name: "N26 Smart", domain: "n26.com", color: "#000000", price: 4.9, cycle: "monthly", category: "finance" },
  { name: "N26 You", domain: "n26.com", color: "#000000", price: 9.9, cycle: "monthly", category: "finance" },
  { name: "N26 Metal", domain: "n26.com", color: "#000000", price: 16.9, cycle: "monthly", category: "finance" },
  { name: "Monzo Plus", domain: "monzo.com", color: "#FF3464", price: 5.0, cycle: "monthly", category: "finance" },
  { name: "Monzo Premium", domain: "monzo.com", color: "#FF3464", price: 15.0, cycle: "monthly", category: "finance" },
  { name: "Wise Card", domain: "wise.com", color: "#9FE870", price: 9.0, cycle: "monthly", category: "finance" },
  { name: "Curve", domain: "curve.com", color: "#000000", price: 4.99, cycle: "monthly", category: "finance" },
  { name: "YNAB", domain: "ynab.com", color: "#0B5FFF", price: 14.99, cycle: "monthly", category: "finance" },
  { name: "Monarch Money", domain: "monarchmoney.com", color: "#1B5E20", price: 14.99, cycle: "monthly", category: "finance" },
  { name: "Copilot Money", domain: "copilot.money", color: "#5D5FEF", price: 13.0, cycle: "monthly", category: "finance" },
  { name: "Rocket Money Premium", domain: "rocketmoney.com", color: "#5C2D91", price: 6.0, cycle: "monthly", category: "finance" },
  { name: "Quicken Simplifi", domain: "quicken.com", color: "#D0021B", price: 5.99, cycle: "monthly", category: "finance" },
  { name: "TradingView Essential", domain: "tradingview.com", color: "#2962FF", price: 14.95, cycle: "monthly", category: "finance" },
  { name: "TradingView Premium", domain: "tradingview.com", color: "#2962FF", price: 59.95, cycle: "monthly", category: "finance" },
  { name: "Seeking Alpha Premium", domain: "seekingalpha.com", color: "#FF7200", price: 29.99, cycle: "monthly", category: "finance" },
  { name: "Coinbase One", domain: "coinbase.com", color: "#0052FF", price: 29.99, cycle: "monthly", category: "finance" },
  { name: "Robinhood Gold", domain: "robinhood.com", color: "#00C805", price: 5.0, cycle: "monthly", category: "finance" },
  { name: "Acorns", domain: "acorns.com", color: "#6F2DBD", price: 3.0, cycle: "monthly", category: "finance" },

  // ── More streaming (European / global) ──────────────────────────────────────
  { name: "SkyShowtime", domain: "skyshowtime.com", color: "#5B2D90", price: 6.99, cycle: "monthly", category: "streaming" },
  { name: "DAZN", domain: "dazn.com", color: "#000000", price: 19.99, cycle: "monthly", category: "streaming" },
  { name: "Viaplay", domain: "viaplay.com", color: "#E6007E", price: 11.99, cycle: "monthly", category: "streaming" },
  { name: "Voyo", domain: "voyo.cz", color: "#FF0000", price: 6.99, cycle: "monthly", category: "streaming" },
  { name: "Prima+", domain: "iprima.cz", color: "#E2001A", price: 5.0, cycle: "monthly", category: "streaming" },
  { name: "O2 TV", domain: "o2tv.cz", color: "#0019AF", price: 8.0, cycle: "monthly", category: "streaming" },
  { name: "Canal+", domain: "canalplus.com", color: "#000000", price: 9.99, cycle: "monthly", category: "streaming" },

  // ── Learning ────────────────────────────────────────────────────────────────
  { name: "Skillshare", domain: "skillshare.com", color: "#002333", price: 13.99, cycle: "monthly", category: "other" },
  { name: "MasterClass", domain: "masterclass.com", color: "#E10B17", price: 10.0, cycle: "monthly", category: "other" },
  { name: "Coursera Plus", domain: "coursera.org", color: "#0056D2", price: 59.0, cycle: "monthly", category: "other" },
  { name: "Udemy Personal Plan", domain: "udemy.com", color: "#A435F0", price: 16.58, cycle: "monthly", category: "other" },
  { name: "Brilliant", domain: "brilliant.org", color: "#2C2C2C", price: 13.49, cycle: "monthly", category: "other" },
  { name: "Codecademy Pro", domain: "codecademy.com", color: "#1F4056", price: 14.99, cycle: "monthly", category: "other" },

  // ── More software / apps ────────────────────────────────────────────────────
  { name: "Apple One Individual", domain: "apple.com", color: "#000000", price: 19.95, cycle: "monthly", category: "software" },
  { name: "Apple One Family", domain: "apple.com", color: "#000000", price: 25.95, cycle: "monthly", category: "software" },
  { name: "Apple One Premier", domain: "apple.com", color: "#000000", price: 37.95, cycle: "monthly", category: "software" },
  { name: "Setapp", domain: "setapp.com", color: "#E6447B", price: 9.99, cycle: "monthly", category: "software" },
  { name: "Bitwarden Premium", domain: "bitwarden.com", color: "#175DDC", price: 10.0, cycle: "yearly", category: "software" },
  { name: "Evernote Personal", domain: "evernote.com", color: "#00A82D", price: 14.99, cycle: "monthly", category: "software" },
  { name: "Readwise", domain: "readwise.io", color: "#FF731C", price: 7.99, cycle: "monthly", category: "software" },
  { name: "Raycast Pro", domain: "raycast.com", color: "#FF6363", price: 8.0, cycle: "monthly", category: "software" },
  { name: "Obsidian Sync", domain: "obsidian.md", color: "#7C3AED", price: 4.0, cycle: "monthly", category: "software" },
  { name: "Fantastical", domain: "flexibits.com", color: "#FF3B30", price: 4.75, cycle: "monthly", category: "software" },
  { name: "Loom Business", domain: "loom.com", color: "#625DF5", price: 12.5, cycle: "monthly", category: "software" },
  { name: "Descript", domain: "descript.com", color: "#3A36DB", price: 24.0, cycle: "monthly", category: "software" },
  { name: "CapCut Pro", domain: "capcut.com", color: "#000000", price: 9.99, cycle: "monthly", category: "software" },
  { name: "Superhuman", domain: "superhuman.com", color: "#000000", price: 30.0, cycle: "monthly", category: "software" },

  // ── More music ──────────────────────────────────────────────────────────────
  { name: "Qobuz", domain: "qobuz.com", color: "#000000", price: 12.99, cycle: "monthly", category: "music" },
  { name: "iHeartRadio Plus", domain: "iheart.com", color: "#C6002B", price: 5.99, cycle: "monthly", category: "music" },

  // ── More gaming ─────────────────────────────────────────────────────────────
  { name: "Humble Choice", domain: "humblebundle.com", color: "#CC2929", price: 11.99, cycle: "monthly", category: "gaming" },
  { name: "Roblox Premium", domain: "roblox.com", color: "#E2231A", price: 4.99, cycle: "monthly", category: "gaming" },
  { name: "World of Warcraft", domain: "blizzard.com", color: "#148EFF", price: 14.99, cycle: "monthly", category: "gaming" },
  { name: "Final Fantasy XIV", domain: "finalfantasyxiv.com", color: "#000000", price: 12.99, cycle: "monthly", category: "gaming" },

  // ── More news / reading ─────────────────────────────────────────────────────
  { name: "The Guardian", domain: "theguardian.com", color: "#052962", price: 12.0, cycle: "monthly", category: "news" },
  { name: "The New Yorker", domain: "newyorker.com", color: "#000000", price: 12.0, cycle: "monthly", category: "news" },
  { name: "The Atlantic", domain: "theatlantic.com", color: "#000000", price: 11.99, cycle: "monthly", category: "news" },
  { name: "Wired", domain: "wired.com", color: "#000000", price: 9.99, cycle: "monthly", category: "news" },
  { name: "Storytel", domain: "storytel.com", color: "#E5472D", price: 16.99, cycle: "monthly", category: "news" },
  { name: "Everand", domain: "everand.com", color: "#1E7B85", price: 11.99, cycle: "monthly", category: "news" },
  { name: "Pocket Premium", domain: "getpocket.com", color: "#EF4056", price: 4.99, cycle: "monthly", category: "news" },

  // ── More fitness / wellness ─────────────────────────────────────────────────
  { name: "Garmin Connect+", domain: "garmin.com", color: "#007CC3", price: 6.99, cycle: "monthly", category: "fitness" },
  { name: "Oura Membership", domain: "ouraring.com", color: "#000000", price: 5.99, cycle: "monthly", category: "fitness" },
  { name: "Alo Moves", domain: "alomoves.com", color: "#000000", price: 12.99, cycle: "monthly", category: "fitness" },
  { name: "Noom", domain: "noom.com", color: "#FFD400", price: 70.0, cycle: "monthly", category: "fitness" },

  // ── Dating ──────────────────────────────────────────────────────────────────
  { name: "Tinder Plus", domain: "tinder.com", color: "#FE3C72", price: 19.99, cycle: "monthly", category: "other" },
  { name: "Tinder Gold", domain: "tinder.com", color: "#FE3C72", price: 29.99, cycle: "monthly", category: "other" },
  { name: "Bumble Premium", domain: "bumble.com", color: "#FFC629", price: 24.99, cycle: "monthly", category: "other" },
  { name: "Hinge+", domain: "hinge.co", color: "#000000", price: 29.99, cycle: "monthly", category: "other" },
];

// Real local Czech monthly prices (Kč) for services that publish CZK pricing.
// Anything not listed falls back to a USD→CZK conversion in `czkPrice`. These
// are editable defaults, same as the USD figures — verify against the provider.
const CZK_PRICES: Record<string, number> = {
  // Streaming
  "Netflix Standard with ads": 199,
  "Netflix Standard": 279,
  "Netflix Premium": 329,
  "Disney+ Basic": 199,
  "Disney+ Premium": 269,
  "Max Ad-Free": 199,
  "Max Ultimate": 279,
  "Apple TV+": 139,
  // Music
  "Spotify Premium": 169,
  "Spotify Duo": 219,
  "Spotify Family": 269,
  "Spotify Student": 85,
  "Apple Music": 109,
  "Apple Music Family": 169,
  "YouTube Premium": 179,
  "YouTube Music": 149,
  // Cloud
  "iCloud+ 50GB": 25,
  "iCloud+ 200GB": 79,
  "iCloud+ 2TB": 249,
  "Google One 100GB": 49,
  "Google One 2TB": 249,
  // Software
  "Microsoft 365 Personal": 99,
  "Microsoft 365 Family": 129,
  // Gaming
  "Xbox Game Pass Ultimate": 379,
  "PC Game Pass": 279,
  "PlayStation Plus Essential": 199,
  // Finance
  "Revolut Plus": 95,
  "Revolut Premium": 220,
  "Revolut Metal": 415,
};

/** The CZK price for an entry: explicit field, known local price, or converted. */
export function czkPrice(entry: CatalogEntry): number {
  return entry.priceCzk ?? CZK_PRICES[entry.name] ?? convertFromUsd(entry.price, "CZK");
}

/** The catalog price to prefill, in the account currency. */
export function catalogPrice(entry: CatalogEntry, currency: CurrencyCode): number {
  if (currency === "USD") return entry.price;
  if (currency === "CZK") return czkPrice(entry);
  return convertFromUsd(entry.price, currency);
}

/** A short, recognizable set surfaced as one-tap quick-adds on the empty state. */
export const POPULAR_DOMAINS = [
  "Netflix Standard",
  "Spotify Premium",
  "ChatGPT Plus",
  "YouTube Premium",
  "iCloud+ 200GB",
  "Disney+ Premium",
  "Xbox Game Pass Ultimate",
  "Notion Plus",
] as const;

export const POPULAR: CatalogEntry[] = POPULAR_DOMAINS.map(
  (name) => CATALOG.find((c) => c.name === name)!,
).filter(Boolean);

/** Names flagged as popular — used when seeding the remote catalog. */
export const POPULAR_NAMES: ReadonlySet<string> = new Set(POPULAR_DOMAINS);

/**
 * Case-insensitive substring match over `entries` (defaults to the bundled
 * catalog; the remote catalog is passed in when available), capped to `limit`.
 */
export function searchCatalog(
  query: string,
  entries: CatalogEntry[] = CATALOG,
  limit = 6,
): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches = entries.filter((c) => c.name.toLowerCase().includes(q));
  // Prioritize names that start with the query.
  matches.sort((a, b) => {
    const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return as - bs || a.name.localeCompare(b.name);
  });
  return matches.slice(0, limit);
}

/** Exact (case-insensitive) catalog match for a typed name, if any. */
export function findCatalogByName(
  name: string,
  entries: CatalogEntry[] = CATALOG,
): CatalogEntry | undefined {
  const n = name.trim().toLowerCase();
  if (!n) return undefined;
  return entries.find((e) => e.name.toLowerCase() === n);
}
