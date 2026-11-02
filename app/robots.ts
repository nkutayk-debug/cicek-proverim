import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

/* Arama motorları ve yapay zekâ tarayıcıları (GEO) siteyi okuyabilsin; film kayıt sayfaları dizine girmesin. */
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "GoogleOther", "Applebot", "Applebot-Extended", "Bingbot",
  "YandexBot", "DuckAssistBot", "Meta-ExternalAgent", "Amazonbot", "MistralAI-User", "CCBot",
];
const PRIVATE = ["/film-studio/", "/film-dikey"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: ["/", "/llms.txt", "/llms-full.txt"], disallow: PRIVATE })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
