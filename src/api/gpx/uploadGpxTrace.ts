import type { GpxUploadPayload } from "../../types/gpx";
import { type FetchOptions, osmFetch } from "../_osmFetch";

/**
 * Uploads a GPX trace. Authentication is optional, like with Notes.
 * Only `<trkpt>` is supported, and the trackpoints must have valid timestamps.
 */
export async function uploadGpxTrace(
  data: GpxUploadPayload,
  options?: FetchOptions
): Promise<unknown> {
  // FIXME: response type
  return osmFetch<unknown>(
    "/0.6/gpx",
    {},
    {
      ...options,
      method: "POST",
      body: new URLSearchParams({
        file: data.file,
        description: data.description,
        tags: JSON.stringify(data.tags), // FIXME: how is this meant to work ??
        visibility: data.visibility,
      }).toString(),
      headers: {
        ...options?.headers,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    }
  );
}
