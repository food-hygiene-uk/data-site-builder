import { join } from "@std/path";
import { walk } from "@std/fs";
import { prettyPrintXml as prettyPrintXml } from "../../lib/xml/xml.mts";
import * as api from "../../ratings-api/rest.mts";
import { sleep } from "../../lib/sleep/sleep.mts";

const APIBuildPath = join("build", "files", "api");

/**
 * Formats JSON and XML files in the specified directory.
 */
const formatApiFiles = async (): Promise<void> => {
  const directoryPath = APIBuildPath;
  console.log(`Starting formatting for files in ${directoryPath}...`);
  try {
    const directoryExists = await Deno.stat(directoryPath)
      .then(() => true)
      .catch(() => false);
    if (!directoryExists) {
      console.warn(`Directory does not exist: ${directoryPath}`);
      return;
    }
    let foundAny = false;
    for await (
      const directoryEntry of walk(directoryPath, {
        exts: [".json", ".xml"],
        includeDirs: false,
        maxDepth: 1,
      })
    ) {
      foundAny = true;
      console.log(`Processing: ${directoryEntry.name} in ${directoryPath}`);
      if (directoryEntry.isFile) {
        const filePath = join(directoryPath, directoryEntry.name);

        if (directoryEntry.name.endsWith(".json")) {
          try {
            const content = await Deno.readTextFile(filePath);
            const jsonObject = JSON.parse(content);
            const formattedContent = `${JSON.stringify(jsonObject, null, 2)}\n`;
            await Deno.writeTextFile(filePath, formattedContent);
            console.log(`Formatted JSON file: ${filePath}`);
          } catch (error) {
            console.error(
              `Error formatting JSON file ${filePath}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        } else if (directoryEntry.name.endsWith(".xml")) {
          try {
            const content = await Deno.readTextFile(filePath);
            const formattedContent = prettyPrintXml(content);
            await Deno.writeTextFile(filePath, formattedContent);
            console.log(`Formatted XML file: ${filePath}`);
          } catch (error) {
            console.error(
              `Error formatting XML file ${filePath}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }
      }
    }
    if (!foundAny) {
      console.warn(`No .json or .xml files found in ${APIBuildPath}`);
    }
    console.log(`Formatting completed for files in ${APIBuildPath}.`);
  } catch (error) {
    console.error(
      `Error reading directory ${APIBuildPath}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const getFilesApi = async (): Promise<void> => {
  for (const language of ["en-GB", "cy-GB"] as const) {
    for (const type of ["json", "xml"] as const) {
      await sleep(1000);
      const authoritiesResponse = await api.authorities({ language, type });
      await Deno.writeTextFile(
        join(APIBuildPath, `authorities-${language}.${type}`),
        String(authoritiesResponse),
      );

      sleep(1000);

      const businessTypesResponse = await api.businessTypes({ language, type });
      await Deno.writeTextFile(
        join(APIBuildPath, `business-types-${language}.${type}`),
        String(businessTypesResponse),
      );

      sleep(1000);

      const countriesResponse = await api.countries({ language, type });
      await Deno.writeTextFile(
        join(APIBuildPath, `countries-${language}.${type}`),
        String(countriesResponse),
      );

      sleep(1000);

      const ratingsResponse = await api.ratings({ language, type });
      await Deno.writeTextFile(
        join(APIBuildPath, `ratings-${language}.${type}`),
        String(ratingsResponse),
      );

      sleep(1000);

      const regionsResponse = await api.regions({ language, type });
      await Deno.writeTextFile(
        join(APIBuildPath, `regions-${language}.${type}`),
        String(regionsResponse),
      );

      sleep(1000);

      const schemeTypesResponse = await api.schemeTypes({ language, type });
      await Deno.writeTextFile(
        join(APIBuildPath, `scheme-types-${language}.${type}`),
        String(schemeTypesResponse),
      );

      sleep(1000);

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

  await formatApiFiles();
};
