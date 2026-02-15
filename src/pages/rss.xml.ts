import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getStories, getDomain } from "@/lib/hn-client";

export async function GET(context: APIContext) {
  const stories = await getStories("top", 30);
  const siteUrl = context.site?.toString() ?? "https://hackernew.dev/";

  return rss({
    title: "HackerNew - Top Stories",
    description:
      "Top stories from Hacker News, served through HackerNew — a modern reimagining.",
    site: siteUrl,
    items: stories.map((story) => ({
      title: story.title,
      link: story.url || `${siteUrl}item/${story.id}`,
      pubDate: new Date(story.time * 1000),
      description: story.url
        ? `${story.score} points | ${story.descendants || 0} comments | ${getDomain(story.url)}`
        : story.text || "",
    })),
    customData: "<language>en-us</language>",
  });
}
