import { join } from "@std/path/join";
import { fromFileUrl } from "@std/path/from-file-url";
import vento from "@vento/vento";
import autoTrim from "@vento/vento/plugins/auto_trim.ts";
import { processCssFile } from "../../lib/css/css.mts";

const environment = vento();
environment.use(autoTrim());
environment.cache.clear();

// Load templates and assets for detail page
const detailPageTemplatePath = fromFileUrl(
  import.meta.resolve("./api-index.vto"),
);
const detailPageTemplatePromise = environment.load(detailPageTemplatePath);

// Process CSS for page
const processedPageCssPromise = processCssFile({
  path: import.meta.resolve("./api-index.css"),
});

const [detailPageTemplate, processedPageCss] = await Promise.all([
  detailPageTemplatePromise,
  processedPageCssPromise,
]);

/**
 * Generates an `index.html` file with a table for the API directory.
 * The table groups files by type, language, and extension.
 *
 * @param targetDirectory The directory for which to generate the `index.html`.
 * @returns The processed API file data, or undefined if an error occurs.
 */
const generateApiIndexData = async (targetDirectory: string) => {
  try {
    const apiFiles = new Map<
      string,
      Map<string, { json?: string; xml?: string }>
    >();
    const fileNameRegex = /^(.*?)-([a-z]{2}-[A-Z]{2})\.(json|xml)$/;

    for await (const directoryEntry of Deno.readDir(targetDirectory)) {
      if (directoryEntry.name === "index.html" || directoryEntry.isDirectory) {
        continue;
      }

      const match = directoryEntry.name.match(fileNameRegex);
      if (match) {
        const [, type, language, extension] = match;

        if (!apiFiles.has(type)) {
          apiFiles.set(type, new Map());
        }
        const languages = apiFiles.get(type)!;
        if (!languages.has(language)) {
          languages.set(language, {});
        }
        const extensions = languages.get(language)!;
        if (extension === "json") {
          extensions.json = directoryEntry.name;
        } else if (extension === "xml") {
          extensions.xml = directoryEntry.name;
        }
      }
    }

    // eslint-disable-next-line unicorn/no-array-sort
    const sortedApiTypes = [...apiFiles.keys()].sort((a, b) =>
      a.localeCompare(b)
    );

    const tablesData = sortedApiTypes.map((type) => {
      const typeDisplayName = type.charAt(0).toUpperCase() +
        type.slice(1).replaceAll("-", " ");
      const languagesMap = apiFiles.get(type)!;
      // eslint-disable-next-line unicorn/no-array-sort
      const sortedLanguages = [...languagesMap.keys()].sort((a, b) =>
        a.localeCompare(b)
      );
      const languages = sortedLanguages.map((language) => ({
        name: language,
        files: languagesMap.get(language)!,
      }));
      return {
        displayName: typeDisplayName,
        languages,
      };
    });

    return tablesData;
  } catch (error) {
    console.error(
      `Failed to generate API index data for ${targetDirectory}:`,
      error,
    );
  }
};

/**
 * Generates the API index page.
 */
export const generateApiIndexPage = async () => {
  console.time("apiIndex");

  const targetDirectory = join("dist", "files", "api");
  const tablesData = await generateApiIndexData(targetDirectory);

  if (!tablesData) {
    console.error("Failed to generate API index data.");
    return;
  }

  const pageHtml = await detailPageTemplate({
    pageCSS: processedPageCss,
    tablesData,
  });

  await Deno.writeTextFile(
    join(targetDirectory, "index.html"),
    pageHtml.content,
  );
  console.log(`Generated API index table for ${targetDirectory}`);

  console.timeEnd("apiIndex");
};
