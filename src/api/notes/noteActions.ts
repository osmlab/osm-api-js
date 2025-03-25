import { type FetchOptions, osmFetch } from "../_osmFetch";

export async function createNote(
  lat: number,
  lng: number,
  text: string,
  options?: FetchOptions
): Promise<void> {
  await osmFetch("/0.6/notes", { lat, lon: lng, text }, options);
}

export async function commentOnNote(
  nodeId: number,
  text: string,
  options?: FetchOptions
): Promise<void> {
  await osmFetch(`/0.6/notes/${nodeId}/comment`, { text }, options);
}

export async function reopenNote(
  nodeId: number,
  text?: string,
  options?: FetchOptions
): Promise<void> {
  await osmFetch(`/0.6/notes/${nodeId}/reopen`, { text }, options);
}
