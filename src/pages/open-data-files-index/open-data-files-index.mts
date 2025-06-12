import { join } from "@std/path/join";

/**
 * Generates an `index.html` file for a given directory.
 *
 * @param targetDirectory The directory for which to generate the `index.html`.
 * @param pagePath The path to display in the title and heading of the index page (e.g., "/", "/api/").
 */
const generateDirectoryIndex = async (
  targetDirectory: string,
  pagePath: string,
) => {
  try {
    const entries = [];
    for await (const directoryEntry of Deno.readDir(targetDirectory)) {
      if (directoryEntry.name === "index.html") {
        continue;
      }
      entries.push({
        name: directoryEntry.name,
        isDirectory: directoryEntry.isDirectory,
      });
    }

    // Sort entries: directories first, then files, all alphabetically
    entries.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) {
        return -1;
      }
      if (!a.isDirectory && b.isDirectory) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });

    const listItems = entries
      .map((entry) => {
        const href = entry.isDirectory ? `${entry.name}/` : entry.name;
        const linkText = entry.isDirectory ? `${entry.name}/` : entry.name;
        return `    <li><a href="${href}">${linkText}</a></li>`;
      })
      .join("\n");

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Index of ${pagePath}</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    h1 { border-bottom: 1px solid #ccc; padding-bottom: 10px; }
    ul { list-style-type: none; padding-left: 0; }
    li { margin: 5px 0; }
    a { text-decoration: none; color: #007bff; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Index of ${pagePath}</h1>
  <ul>
${listItems}
  </ul>
</body>
</html>`;

    await Deno.writeTextFile(join(targetDirectory, "index.html"), htmlContent);
    console.log(`Generated index.html for ${targetDirectory}`);
  } catch (error) {
    console.error(
      `Failed to generate index.html for ${targetDirectory}:`,
      error,
    );
  }
};

export const openDataFilesIndex = async () => {
  await generateDirectoryIndex(join("dist"), "/");
  await generateDirectoryIndex(join("dist", "files"), "/files/");
  await generateDirectoryIndex(
    join("dist", "files", "open-data-files"),
    "files/open-data-files/",
  );
};
