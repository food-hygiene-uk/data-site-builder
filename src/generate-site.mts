import { copy, emptyDir, ensureDir } from "@std/fs";
import { config } from "./lib/config/config.mts";
import * as api from "./ratings-api/rest.mts";
import { authoritiesResponseSchema } from "./ratings-api/schema.mts";
import { generateApiIndexPage } from "./pages/api-index/api-index.mts";
import { openDataFilesIndex } from "./pages/open-data-files-index/open-data-files-index.mts";
import { getFilesApi } from "./generate-site/files-api/files-api.mts";
import { getFilesOpenDataFiles } from "./generate-site/files-open-data-files/files-open-data-files.mts";

console.time("generate-site");

// Ensure build/dist directories exist
await emptyDir("build");
await ensureDir("build/files");
await ensureDir("build/files/open-data-files");
await ensureDir("build/files/api");

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
sitemapXmlContent = sitemapXmlContent.replaceAll("<loc>/", `<loc>${baseURL}/`);
await Deno.writeTextFile(sitemapXmlPath, sitemapXmlContent);

const authoritiesResponse = authoritiesResponseSchema.parse(
  JSON.parse(await api.authorities()),
);
// Use all authorities in CI, otherwise just use the first one
const apiAuthorities = Deno.env.get("CI") ? authoritiesResponse.authorities : [
  authoritiesResponse.authorities.find(
    (authority) =>
      ["Scotland", "Wales", "Northern Ireland"].includes(
        authority.RegionName,
      ) === false,
  )!,
  authoritiesResponse.authorities.find(
    (authority) => authority.RegionName === "Northern Ireland",
  )!,
  authoritiesResponse.authorities.find(
    (authority) => authority.RegionName === "Scotland",
  )!,
  authoritiesResponse.authorities.find(
    (authority) => authority.RegionName === "Wales",
  )!,
];

await Promise.all([getFilesApi(), getFilesOpenDataFiles(apiAuthorities)]);

await copy("build", "dist", { overwrite: true });

await generateApiIndexPage();
await openDataFilesIndex();

console.timeEnd("generate-site");
