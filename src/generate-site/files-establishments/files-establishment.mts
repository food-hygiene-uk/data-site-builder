import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import { walk } from "@std/fs";

/**
 * Generates individual JSON files for each establishment from FHRS open data files.
 *
 * Reads all FHRS*en-GB.json and FHRS*cy-GB.json files from the specified open data directory, extracts
 * each establishment from the EstablishmentCollection array, and writes each
 * establishment to the specified establishments directory with the filename
 * `{FHRSID}-{lang}.json` where `lang` is the language code extracted from the
 * source filename (e.g. `en-GB` or `cy-GB`). Output is pretty-printed with
 * 2-space indentation.
 *
 * Duplicate FHRSIDs across files will result in the last processed establishment
 * overwriting previous ones.
 *
 * @param openDataFilesDirectory - Directory containing FHRS*en-GB.json files (default: "build/files/open-data-files")
 * @param establishmentsDirectory - Directory to write establishment JSON files (default: "build/files/establishments")
 */
export const generateEstablishments = async (
  openDataFilesDirectory = join("build", "files", "open-data-files"),
  establishmentsDirectory = join("build", "files", "establishments"),
) => {
  await ensureDir(establishmentsDirectory);

  console.log(`Processing establishment files from: ${openDataFilesDirectory}`);

  for await (
    const entry of walk(openDataFilesDirectory, {
      includeDirs: false,
      // match both English and Welsh JSON files
      match: [/FHRS.*(?:en-GB|cy-GB)\.json$/],
    })
  ) {
    if (entry.isFile) {
      const fileContent = await Deno.readTextFile(entry.path);
      const data = JSON.parse(fileContent);

      const establishmentCollection = data.FHRSEstablishment
        ?.EstablishmentCollection;
      if (!Array.isArray(establishmentCollection)) {
        console.warn(`No EstablishmentCollection found in ${entry.path}`);
        continue;
      }

      // determine language suffix from filename (en-GB or cy-GB)
      const fileName = entry.path.split(/[\\/]/).pop() || "";
      const langMatch = fileName.match(/(en-GB|cy-GB)\.json$/);
      const lang = langMatch ? langMatch[1] : "en-GB";

      for (const establishment of establishmentCollection) {
        const fhrsId = establishment.FHRSID;
        if (typeof fhrsId !== "number") {
          console.warn(`Invalid FHRSID in ${entry.path}: ${fhrsId}`);
          continue;
        }

        const outputPath = join(
          establishmentsDirectory,
          `${fhrsId}-${lang}.json`,
        );
        const prettyJson = JSON.stringify(establishment, null, 2);
        await Deno.writeTextFile(outputPath, prettyJson);
      }
    }
  }

  console.log("Establishment files generated successfully.");
};
