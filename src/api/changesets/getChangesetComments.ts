import type { BasicFilters, ChangesetComment } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";

export type ChangesetCommentsFilter = BasicFilters;

/** get a single changeset */
export async function getChangesetComments(
  filter: ChangesetCommentsFilter,
  options?: FetchOptions
): Promise<ChangesetComment[]> {
  const raw = await osmFetch<{ comments: ChangesetComment[] }>(
    "/0.6/changeset_comments.json",
    filter,
    options
  );

  return raw.comments;
}
