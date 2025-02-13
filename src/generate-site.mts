import { copy, emptyDir, ensureDir } from "@std/fs";
import { config } from "./lib/config/config.mts";
import * as api from "./ratings-api/rest.mts";
import { join } from "@std/path/join";
import { authoritiesResponseSchema } from "./ratings-api/schema.mts";

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
const APIBuildPath = join("build", "files", "api");

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

export const getBuildFileName = (dataURL: string) => {
  const match = dataURL.match(/\/([^/]*\.(json|xml))$/);
  if (!match) {
    throw new Error(`Invalid dataURL: ${dataURL}`);
  }

  return join("build", "files", "open-data-files", match[1]);
};

const authoritiesResponse = authoritiesResponseSchema.parse(
  JSON.parse(await api.authorities()),
);
// Use all authorities in CI, otherwise just use the first one
const apiAuthorities = Deno.env.get("CI") ? authoritiesResponse.authorities : [
  authoritiesResponse.authorities.find((authority) =>
    ["Scotland", "Wales", "Northern Ireland"].includes(
      authority.RegionName,
    ) === false
  )!,
  authoritiesResponse.authorities.find((authority) =>
    authority.RegionName === "Northern Ireland"
  )!,
  authoritiesResponse.authorities.find((authority) =>
    authority.RegionName === "Scotland"
  )!,
  authoritiesResponse.authorities.find((authority) =>
    authority.RegionName === "Wales"
  )!,
];

await Promise.all(apiAuthorities.map(async (localAuthority) => {
  const downloads = [];

  const xmlDataURL = localAuthority.FileName;
  const xmlFilename = getBuildFileName(xmlDataURL);
  downloads.push({ url: xmlDataURL, filename: xmlFilename });

  const jsonDataURL = localAuthority.FileName.replace(/\.xml$/, ".json");
  const jsonFilename = getBuildFileName(jsonDataURL);
  downloads.push({ url: jsonDataURL, filename: jsonFilename });

  if (localAuthority.FileNameWelsh !== null) {
    const xmlDataURLWelsh = localAuthority.FileNameWelsh;
    const xmlFilenameWelsh = getBuildFileName(xmlDataURLWelsh);
    downloads.push({ url: xmlDataURLWelsh, filename: xmlFilenameWelsh });

    const jsonDataURLWelsh = localAuthority.FileNameWelsh.replace(
      /\.xml$/,
      ".json",
    );
    const jsonFilenameWelsh = getBuildFileName(jsonDataURLWelsh);
    downloads.push({ url: jsonDataURLWelsh, filename: jsonFilenameWelsh });
  }

  for (const { url, filename } of downloads) {
    const data = await api.localAuthorityData(url);
    await Deno.writeTextFile(filename, data);
  }
}));

for (const language of ["en-GB", "cy-GB"] as const) {
  for (const type of ["json", "xml"] as const) {
    const authoritiesResponse = await api.authorities({ language, type });
    await Deno.writeTextFile(
      join(APIBuildPath, `authorities-${language}.${type}`),
      String(authoritiesResponse),
    );

    const businessTypesResponse = await api.businessTypes({ language, type });
    await Deno.writeTextFile(
      join(APIBuildPath, `business-types-${language}.${type}`),
      String(businessTypesResponse),
    );

    const countriesResponse = await api.countries({ language, type });
    await Deno.writeTextFile(
      join(APIBuildPath, `countries-${language}.${type}`),
      String(countriesResponse),
    );

    const ratingsResponse = await api.ratings({ language, type });
    await Deno.writeTextFile(
      join(APIBuildPath, `ratings-${language}.${type}`),
      String(ratingsResponse),
    );

    const regionsResponse = await api.regions({ language, type });
    await Deno.writeTextFile(
      join(APIBuildPath, `regions-${language}.${type}`),
      String(regionsResponse),
    );

    const schemeTypesResponse = await api.schemeTypes({ language, type });
    await Deno.writeTextFile(
      join(APIBuildPath, `scheme-types-${language}.${type}`),
      String(schemeTypesResponse),
    );

    const scoreDescriptorsResponse = await api.scoreDescriptors({
      language,
      type,
    });
    await Deno.writeTextFile(
      join(APIBuildPath, `score-descriptors-${language}.${type}`),
      String(scoreDescriptorsResponse),
    );
  }
}

await copy("build", "dist", { overwrite: true });

console.timeEnd("generate-site");
