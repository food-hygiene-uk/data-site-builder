import { XMLBuilder, XMLParser } from "fast_xml_parser";

/**
 * Formats an XML string using XSLT for pretty printing.
 *
 * @param sourceXml - The XML string to format.
 * @returns The formatted XML string.
 */
export const prettyPrintXml = (sourceXml: string): string => {
  // Parse the XML into a JavaScript object
  const parser = new XMLParser({
    ignoreAttributes: false,
  });
  const parsedObject = parser.parse(sourceXml);

  // Build the XML back with formatting
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressBooleanAttributes: false,
  });

  return builder.build(parsedObject);
};
