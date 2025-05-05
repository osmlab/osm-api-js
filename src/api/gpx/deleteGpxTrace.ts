import { type FetchOptions, osmFetch } from "../_osmFetch";

/** requires authentication */
export async function deleteGpxTrace(
  gpxTraceId: string,
  options?: FetchOptions
): Promise<void> {
  // FIXME: response type
  await osmFetch<unknown>(
    `/0.6/gpx/${gpxTraceId}.json`,
    {},
    { ...options, method: "DELETE" }
  );
}
