import type { BBox, BasicFilters, OsmNote } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";
import type { RawNote, RawNotesSearch } from "../_rawResponse";

/** @internal */
export const featureToNote = (feature: RawNote): OsmNote => {
  const [lng, lat] = feature.geometry.coordinates;
  return {
    ...feature.properties,
    location: { lat, lng },
  };
};

export interface ListNotesOptions extends BasicFilters {
  /** The search query */
  q: string;
  /** Limits notes to the given bounding box */
  bbox?: BBox | string;
  /**
   * The number of days a note needs to be closed to no longer be returned.
   * @default 7
   */
  closed?: number;
  /** The value which should be used to sort the notes */
  sort?: "created_at" | "updated_at";
  /** The order of the returned notes */
  order?: "oldest" | "newest";
}

async function $getNotes(
  query: ListNotesOptions | { bbox: string | BBox },
  suffix: boolean,
  options: FetchOptions | undefined
): Promise<OsmNote[]> {
  const raw = await osmFetch<RawNotesSearch>(
    `/0.6/notes${suffix ? "/search" : ""}.json`,
    query,
    options
  );

  return raw.features.map(featureToNote);
}

/**
 * Returns a list of notes matching either the initial note text, or any of the
 * comments. The notes will be ordered by the date of their last change, with
 * the most recent one first.
 *
 * If no query is specified, the latest notes are returned.
 */
export function getNotesForQuery(
  query: ListNotesOptions,
  options?: FetchOptions
): Promise<OsmNote[]> {
  return $getNotes(query, true, options);
}

/**
 * Returns a list of notes within the specified bounding box. The notes
 * will be ordered by the date of their last change, with the most recent
 * one first.
 */
export function getNotesForArea(
  bbox: BBox | string,
  options?: FetchOptions
): Promise<OsmNote[]> {
  return $getNotes({ bbox }, false, options);
}

export async function getNote(
  noteId: number,
  options?: FetchOptions
): Promise<OsmNote> {
  const raw = await osmFetch<RawNote>(
    `/0.6/notes/${noteId}.json`,
    undefined,
    options
  );
  return featureToNote(raw);
}
