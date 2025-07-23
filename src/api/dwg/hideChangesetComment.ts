import type { Changeset } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";
import type { RawChangeset } from "../_rawResponse";
import { mapRawChangeset } from "../changesets";

/** DWG only */
export async function hideChangesetComment(
  changesetCommentId: number,
  action?: "hide" | "unhide",
  options?: FetchOptions
): Promise<Changeset> {
  const result = await osmFetch<{ changeset: RawChangeset }>(
    `/0.6/changeset_comments/${changesetCommentId}/visibility.json`,
    {},
    { ...options, method: action === "unhide" ? "POST" : "DELETE" }
  );
  return mapRawChangeset(result.changeset);
}
