import type { OsmFeatureType } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";

/** DWG only */
export async function redactFeature(
  {
    featureType,
    featureId,
    featureVersion,
    redactionId,
  }: {
    featureType: OsmFeatureType;
    featureId: number;
    featureVersion: number;
    /** if undefined, the feature is un-redacted */
    redactionId: number | undefined;
  },
  options?: FetchOptions
): Promise<void> {
  await osmFetch(
    // response has content-length: 0, so don't use the .json file extension,
    // otherwise it will try to parse the empty string as JSON.
    `/0.6/${featureType}/${featureId}/${featureVersion}/redact`,
    redactionId ? { redaction: redactionId } : {},
    { ...options, method: "POST" }
  );
}
