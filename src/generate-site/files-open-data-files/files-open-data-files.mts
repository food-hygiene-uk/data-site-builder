import { XMLBuilder, XMLParser } from "fast_xml_parser";
import { z } from "zod";
import {
  authoritiesResponseSchema,
  dataSchema,
} from "../../ratings-api/schema.mts";
import { join } from "@std/path";
import { walk } from "@std/fs";
import * as api from "../../ratings-api/rest.mts";
import { Establishment, LocalAuthorityData } from "../../ratings-api/types.mts";

/**
 * Parses an XML string, sorts EstablishmentDetail elements by FHRSID,
 * and serializes it back to an XML string.
 * If the expected structure for sorting is not found, or if parsing/building fails,
 * it logs a warning/error and returns the original XML string.
 *
 * @param sourceXml - The XML string to process.
 * @returns The XML string with sorted EstablishmentDetail elements, or the original if processing failed.
 */
export const sortEstablishmentsInXml = (sourceXml: string): string => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    // Ensure EstablishmentDetail is treated as an array, critical for sorting
    isArray: (_name, jpath, _isLeafNode, _isAttribute) =>
      jpath === "FHRSEstablishment.EstablishmentCollection.EstablishmentDetail",
    parseTagValue: true,
    parseAttributeValue: true,
  });

  let parsedObject: LocalAuthorityData;
  try {
    parsedObject = parser.parse(sourceXml);
  } catch (parseError) {
    console.error(
      "XML parsing failed during sort operation:",
      parseError,
      `Source: ${sourceXml.slice(0, 200)}...`,
    );
    return sourceXml; // Return original XML if parsing fails
  }

  const establishmentCollection = parsedObject?.FHRSEstablishment
    ?.EstablishmentCollection;

  if (
    Array.isArray(establishmentCollection) &&
    establishmentCollection.length > 0
  ) {
    establishmentCollection.sort((a: Establishment, b: Establishment) => {
      const idA = Number(a.FHRSID);
      const idB = Number(b.FHRSID);

      // Handle cases where FHRSID might not be a valid number
      if (Number.isNaN(idA) && Number.isNaN(idB)) return 0;
      if (Number.isNaN(idA)) return 1; // Push NaNs (or unparseable) to the end
      if (Number.isNaN(idB)) return -1; // Keep non-NaNs first

      return idA - idB;
    });
  } else {
    // Not an error if not found, file might be structured differently or empty of these elements.
    console.log(
      "No EstablishmentDetail elements to sort, or structure unexpected in XML.",
    );
  }

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: false, // No general pretty-print; specific formatting is handled later
    suppressEmptyNode: true, // Suppress empty tags like <Geocode/> instead of <Geocode></Geocode>
    unpairedTags: ["link", "meta"], // Example of unpaired tags if needed
  });

  try {
    return builder.build(parsedObject);
  } catch (buildError) {
    console.error("XML building failed after sorting:", buildError);
    return sourceXml; // Return original XML if building fails
  }
};

/**
 * Ensures there is exactly one newline before each <EstablishmentDetail> tag in an XML string.
 * It replaces any existing newlines (or lack thereof) immediately preceding the tag with a single newline.
 *
 * @param xmlContent - The XML content as a string.
 * @returns The modified XML content.
 */
const ensureSingleNewlineBeforeEstablishmentDetail = (
  xmlContent: string,
): string => {
  return xmlContent.replaceAll(
    /(<Header>|<EstablishmentCollection>|<EstablishmentDetail>|<\/EstablishmentCollection>)/g,
    "\n$1",
  );
};

/**
 * Reformats a single open data XML file by sorting establishments and ensuring a newline before each <EstablishmentDetail> tag.
 *
 * @param filePath - The path to the XML file.
 */
const processSingleOpenDataXmlFile = async (filePath: string) => {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    // First, sort the establishments within the XML content
    const sortedXmlContent = sortEstablishmentsInXml(fileContent);
    // Then, ensure newlines before <EstablishmentDetail> tags in the sorted content
    const modifiedContent = ensureSingleNewlineBeforeEstablishmentDetail(
      sortedXmlContent,
    );

    // Only write if content changed to avoid unnecessary file operations/mtime updates
    if (modifiedContent !== fileContent) {
      // Compare with original if no change occurred through both steps
      await Deno.writeTextFile(filePath, modifiedContent);
      console.log(`Processed and formatted XML file: ${filePath}`);
    }
  } catch (error) {
    console.error(
      `Error processing XML file ${filePath} for sorting and <EstablishmentDetail> newlines:`,
      error,
    );
  }
};

/**
 * Finds and processes all XML files in the open data directory
 * to sort establishments and ensure a newline before each <EstablishmentDetail> tag.
 */
const processOpenDataXmlFiles = async () => {
  const openDataFilesDirectory = join("build", "files", "open-data-files");
  console.log(`Processing XML files in: ${openDataFilesDirectory}.`);
  let foundXmlFiles = false;
  for await (
    const entry of walk(openDataFilesDirectory, {
      exts: [".xml"],
      includeDirs: false,
      maxDepth: 1,
    })
  ) {
    if (entry.isFile) {
      foundXmlFiles = true;
      await processSingleOpenDataXmlFile(entry.path);
    }
  }
  if (!foundXmlFiles) {
    console.warn(
      `No .xml files found in ${openDataFilesDirectory} to process.`,
    );
  }
};

/**
 * Reformats a single JSON file to sort establishments by FHRSID and make diffs cleaner.
 *
 * @param filePath - The path to the JSON file.
 */
const processSingleOpenDataJsonFile = async (filePath: string) => {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    const parsedJson = JSON.parse(fileContent);
    // If this fails, it will throw an error caught below
    dataSchema.parse(parsedJson);
    // We don't want to risk losing any properties that are not in the schema.
    // So we keep the original structure, not the Zod parsed object.
    const jsonData = parsedJson as typeof dataSchema._type;

    if (Array.isArray(jsonData?.FHRSEstablishment?.EstablishmentCollection)) {
      jsonData.FHRSEstablishment.EstablishmentCollection.sort(
        (a, b) => a.FHRSID - b.FHRSID,
      );

      const newJsonString = JSON.stringify(jsonData).replaceAll(
        // This can easily flake if the structure changes
        /("Header":|"EstablishmentCollection":|{"FHRSID":|]}}$)/g,
        "\n$1",
      );

      await Deno.writeTextFile(filePath, newJsonString);
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
const processOpenDataJsonFiles = async () => {
  const openDataFilesDirectory = join("build", "files", "open-data-files");
  console.log(`Processing JSON files in: ${openDataFilesDirectory}`);
  for await (
    const entry of walk(openDataFilesDirectory, {
      exts: [".json"],
      includeDirs: false,
      maxDepth: 1,
    })
  ) {
    if (entry.isFile) {
      await processSingleOpenDataJsonFile(entry.path);
    }
  }
};

/**
 * Generates the build file path for a given data URL.
 *
 * Extracts the filename with a `.json` or `.xml` extension from the provided `dataURL`
 * and constructs a path under the `build/files/open-data-files` directory.
 *
 * @param dataURL - The URL string pointing to a data file (must end with `.json` or `.xml`).
 * @returns The build file path as a string.
 * @throws {Error} If the `dataURL` does not match the expected pattern.
 */
export const getBuildFileName = (dataURL: string) => {
  const match = dataURL.match(/\/([^/]*\.(json|xml))$/);
  if (!match) {
    throw new Error(`Invalid dataURL: ${dataURL}`);
  }

  return join("build", "files", "open-data-files", match[1]);
};

export const getFilesOpenDataFiles = async (
  apiAuthorities: typeof authoritiesResponseSchema._type.authorities,
): Promise<void> => {
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

  await Promise.all([processOpenDataXmlFiles(), processOpenDataJsonFiles()]);
};
