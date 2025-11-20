import { XMLParser } from "fast-xml-parser";

/** @internal */
export const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributesGroupName: "$",
  attributeNamePrefix: "",
  isArray: (tagName) => tagName !== "$",
  attributeValueProcessor(_name, value) {
    return value
      .replaceAll(/&#(x9|9);/g, "\t")
      .replaceAll(/&#(xA|10);/g, "\n")
      .replaceAll(/&#(xD|13);/g, "\r");
  },
});
