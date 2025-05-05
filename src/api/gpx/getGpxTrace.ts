import { type FetchOptions, osmFetch } from "../_osmFetch";

/** requires authentication if the trace is private */
export async function getGpxTrace(
  gpxTraceId: number,
  options?: FetchOptions
): Promise<unknown> {
  // FIXME: response type
  // this is an XML-only API
  return osmFetch<unknown>(`/0.6/gpx/${gpxTraceId}/data.gpx`, {}, options);
}
