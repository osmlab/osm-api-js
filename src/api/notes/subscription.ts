import { type FetchOptions, osmFetch } from "../_osmFetch";

export async function subscribeToNote(
  noteId: number,
  options?: FetchOptions
): Promise<void> {
  await osmFetch(
    `/0.6/notes/${noteId}/subscription`,
    {},
    { ...options, method: "POST" }
  );
}

export async function unsubscribeFromNote(
  noteId: number,
  options?: FetchOptions
): Promise<void> {
  await osmFetch(
    `/0.6/notes/${noteId}/subscription`,
    {},
    { ...options, method: "DELETE" }
  );
}
