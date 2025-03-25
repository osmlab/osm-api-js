import { type FetchOptions, osmFetch } from "../_osmFetch";

export async function deletePreferences(
  key: string,
  options?: FetchOptions
): Promise<void> {
  await osmFetch<"">(
    `/0.6/user/preferences/${key}.json`,
    {},
    { ...options, method: "DELETE" }
  );
}
