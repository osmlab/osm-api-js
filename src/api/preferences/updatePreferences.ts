import { type FetchOptions, osmFetch } from "../_osmFetch";

export async function updatePreferences(
  key: string,
  value: string,
  options?: FetchOptions
): Promise<void> {
  await osmFetch<"">(
    `/0.6/user/preferences/${key}.json`,
    {},
    { ...options, method: "PUT", body: value }
  );
}
