import { type FetchOptions, osmFetch } from "../_osmFetch";

/** requires authentication if the trace is private */
export async function getGpxTraceMetadata(
  gpxTraceId: string,
  options?: FetchOptions
): Promise<unknown> {
  // FIXME: response type
  // FIXME: is this an XML-only API?
  return osmFetch<unknown>(`/0.6/gpx/${gpxTraceId}.json`, {}, options);
}
