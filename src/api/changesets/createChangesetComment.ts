import type { Changeset } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";

/** Add a comment to a changeset. The changeset must be closed. */
export async function createChangesetComment(
  changesetId: number,
  commentText: string,
  options?: FetchOptions
): Promise<Changeset> {
  const result = await osmFetch<{ changeset: Changeset }>(
    `/0.6/changeset/${changesetId}/comment.json`,
    undefined,
    {
      ...options,
      method: "POST",
      body: `text=${encodeURIComponent(commentText)}`,
      headers: {
        ...options?.headers,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    }
  );
  return result.changeset;
}
