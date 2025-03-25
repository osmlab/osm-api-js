import type { Tags } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";

export async function getPreferences(options?: FetchOptions): Promise<Tags> {
  const raw = await osmFetch<{ preferences: Tags }>(
    "/0.6/user/preferences.json",
    undefined,
    options
  );

  return raw.preferences;
}
