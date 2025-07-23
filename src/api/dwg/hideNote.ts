import type { OsmNote } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";
import type { RawNote } from "../_rawResponse";
import { featureToNote } from "../notes";

/** DWG only */
export async function hideNote(
  nodeId: number,
  text?: string,
  options?: FetchOptions
): Promise<OsmNote> {
  const raw = await osmFetch<RawNote>(
    `/0.6/notes/${nodeId}.json`,
    text ? { text } : {},
    { ...options, method: "DELETE" }
  );
  return featureToNote(raw);
}
