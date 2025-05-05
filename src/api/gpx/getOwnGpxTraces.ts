import { type FetchOptions, osmFetch } from "../_osmFetch";

/** gets all GPX traces belonging to the currently-authenticated user. */
export async function getOwnGpxTraces(
  options?: FetchOptions
): Promise<unknown> {
  // FIXME: response type
  return osmFetch<unknown>("/0.6/user/gpx_files.json", {}, options);
}
