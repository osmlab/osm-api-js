import { type FetchOptions, osmFetch } from "../_osmFetch";

export async function subscribeToChangeset(
  changesetId: number,
  options?: FetchOptions
): Promise<void> {
  await osmFetch(
    `/0.6/changeset/${changesetId}/subscribe`,
    {},
    { ...options, method: "POST" }
  );
}

export async function unsubscribeFromChangeset(
  changesetId: number,
  options?: FetchOptions
): Promise<void> {
  await osmFetch(
    `/0.6/changeset/${changesetId}/unsubscribe`,
    {},
    { ...options, method: "POST" }
  );
}
