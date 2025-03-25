import type { OsmChange } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";
import type { RawOsmChange } from "../_rawResponse";
import { parseOsmChangeJson } from "./_parseOsmChangeXml";

/** gets the osmChange file for a changeset */
export async function getChangesetDiff(
  id: number,
  options?: FetchOptions
): Promise<OsmChange> {
  const raw = await osmFetch<RawOsmChange>(
    `/0.6/changeset/${id}/download`,
    undefined,
    options
  );

  return parseOsmChangeJson(raw);
}
