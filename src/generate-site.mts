import { z } from "zod"; // Import z
import { copy, emptyDir, ensureDir, walk } from "@std/fs";
import { config } from "./lib/config/config.mts";
import * as api from "./ratings-api/rest.mts";
import { join } from "@std/path";
import {
  authoritiesResponseSchema,
  dataSchema,
} from "./ratings-api/schema.mts"; // Import dataSchema
import { generateApiIndexPage } from "./pages/api-index/api-index.mts";
import { openDataFilesIndex } from "./pages/open-data-files-index/open-data-files-index.mts";

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
sitemapXmlContent = sitemapXmlContent.replaceAll("<loc>/", `<loc>${baseURL}/`);
await Deno.writeTextFile(sitemapXmlPath, sitemapXmlContent);

/**
 * Reformats a JSON file to sort establishments by FHRSID and make diffs cleaner.
 *
 * @param filePath - The path to the JSON file.
 */
const reformatJsonFile = async (filePath: string) => {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    // Use dataSchema to parse the JSON content
    const jsonData = dataSchema.parse(JSON.parse(fileContent));

    if (
      Array.isArray(jsonData?.FHRSEstablishment?.EstablishmentCollection)
    ) {
      // Sort the EstablishmentCollection
      jsonData.FHRSEstablishment.EstablishmentCollection.sort((a, b) =>
        a.FHRSID - b.FHRSID
      );

      let newJsonString = "{\n";
      newJsonString += `  "FHRSEstablishment": {\n`;
      // Add other keys from FHRSEstablishment if they exist and need specific formatting
      // For now, assuming EstablishmentCollection is the primary content to format.
      // If other keys exist within FHRSEstablishment, they would be handled here.
      // e.g., newJsonString += `  "OtherKeyInFHRSEstablishment": ${JSON.stringify(jsonData.FHRSEstablishment.OtherKeyInFHRSEstablishment)},\n`;

      newJsonString += `    "EstablishmentCollection": [\n`;
      for (
        const [index, est] of jsonData.FHRSEstablishment.EstablishmentCollection
          .entries()
      ) {
        newJsonString += `      ${JSON.stringify(est)}`; // Each establishment on one line
        if (
          index < jsonData.FHRSEstablishment.EstablishmentCollection.length - 1
        ) {
          newJsonString += ",";
        }
        newJsonString += "\n";
      }
      newJsonString += "    ]\n";
      newJsonString += "  }\n";
      // Handle other top-level keys if they exist (e.g., meta, links from the original API response if they were part of dataSchema)
      // For now, assuming FHRSEstablishment is the only top-level key defined in dataSchema that we are processing this way.
      // If dataSchema included other top-level keys like 'meta' or 'links' that are siblings to FHRSEstablishment,
      // they would need to be stringified here. Example:
      // if (jsonData.meta) {
      //   newJsonString += `,\n  "meta": ${JSON.stringify(jsonData.meta, null, 2)}`;
      // }
      newJsonString += "}\n";

      await Deno.writeTextFile(filePath, newJsonString); // Removed extra newline, as newJsonString ends with one.
      console.log(`Reformatted: ${filePath}`);
    } else {
      console.warn(
        `Warning: Could not find FHRSEstablishment.EstablishmentCollection in ${filePath}`, // Updated warning
      );
    }
  } catch (error) {
    // If it's a ZodError, it means parsing failed according to dataSchema
    if (error instanceof z.ZodError) {
      console.error(
        `Error parsing file ${filePath} with dataSchema:`,
        error.issues,
      );
    } else {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
};

/**
 * Finds and reformats all JSON files in the open data directory.
 */
const formatOpenDataFiles = async () => {
  const openDataFilesDirectory = join("build", "files", "open-data-files");
  console.log(`Looking for JSON files in: ${openDataFilesDirectory}`);
  for await (
    const entry of walk(openDataFilesDirectory, {
      exts: [".json"],
      includeDirs: false,
      maxDepth: 1,
    })
  ) {
    if (entry.isFile) {
      await reformatJsonFile(entry.path);
    }
  }
};

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

await Promise.all(
  apiAuthorities.map(async (localAuthority) => {
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
  }),
);

await formatOpenDataFiles();

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

await generateApiIndexPage();
await openDataFilesIndex();

console.timeEnd("generate-site");
