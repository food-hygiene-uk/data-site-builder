import { fromFileUrl } from "@std/path";
import postcss from "postcss";
import cssnano from "cssnano";

/**
 * Processes a CSS file by applying transformations and injecting additional CSS.
 *
 * @param params - Parameters for processing CSS.
 * @param params.path - The file path to the CSS file.
 * @returns A promise that resolves to the processed CSS as a string.
 */
export const processCssFile = async ({
  path,
}: {
  path: string;
}): Promise<string> => {
  const cssPath = fromFileUrl(path);
  const content = await globalThis.Deno.readTextFile(cssPath);
  const cssContent = content;

  const processedCss = await postcss([cssnano]).process(cssContent, {
    from: undefined,
  });

  return processedCss.css;
};

/**
 * Adds a suffix to all CSS class names in the provided CSS string.
 *
 * @param css - The CSS content as a string.
 * @param classSuffix - The suffix to append to class names.
 * @returns The modified CSS with suffixed class names.
 */
export const cssAddSuffix = (css: string, classSuffix: string): string => {
  return css.replaceAll("__CLASS_SUFFIX__", classSuffix);
};
