import { copy, emptyDir, ensureDir } from "@std/fs";
import { config } from "./lib/config/config.mts";

// Ensure build/dist directories exist
await ensureDir("build");

await emptyDir("dist");
await ensureDir("dist/sitemap");

await copy("assets", "dist", { overwrite: true });

const baseURL = config.BASE_URL;

// Update robots.txt to include BASE_URL
const robotsTxtPath = "dist/robots.txt";
let robotsTxtContent = await Deno.readTextFile(robotsTxtPath);
robotsTxtContent = robotsTxtContent.replace(
  /Sitemap: \//,
  `Sitemap: ${baseURL}/`,
);
await Deno.writeTextFile(robotsTxtPath, robotsTxtContent);

// Update sitemap.xml to include BASE_URL
const sitemapXmlPath = "dist/sitemap.xml";
let sitemapXmlContent = await Deno.readTextFile(sitemapXmlPath);
sitemapXmlContent = sitemapXmlContent.replaceAll(
  /<loc>\//g,
  `<loc>${baseURL}/`,
);
await Deno.writeTextFile(sitemapXmlPath, sitemapXmlContent);
