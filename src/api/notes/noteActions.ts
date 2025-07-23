import type { OsmNote } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";
import type { RawNote } from "../_rawResponse";
import { featureToNote } from "./getNotes";

export async function createNote(
  lat: number,
  lng: number,
  text: string,
  options?: FetchOptions
): Promise<OsmNote> {
  const raw = await osmFetch<RawNote>(
    "/0.6/notes.json",
    { lat, lon: lng, text },
    { ...options, method: "POST" }
  );
  return featureToNote(raw);
}

export async function commentOnNote(
  nodeId: number,
  text: string,
  options?: FetchOptions
): Promise<OsmNote> {
  const raw = await osmFetch<RawNote>(
    `/0.6/notes/${nodeId}/comment.json`,
    text ? { text } : {},
    { ...options, method: "POST" }
  );
  return featureToNote(raw);
}

export async function closeNote(
  nodeId: number,
  text?: string,
  options?: FetchOptions
): Promise<OsmNote> {
  const raw = await osmFetch<RawNote>(
    `/0.6/notes/${nodeId}/close.json`,
    text ? { text } : {},
    { ...options, method: "POST" }
  );
  return featureToNote(raw);
}

export async function reopenNote(
  nodeId: number,
  text?: string,
  options?: FetchOptions
): Promise<OsmNote> {
  const raw = await osmFetch<RawNote>(
    `/0.6/notes/${nodeId}/reopen.json`,
    text ? { text } : {},
    { ...options, method: "POST" }
  );
  return featureToNote(raw);
}
