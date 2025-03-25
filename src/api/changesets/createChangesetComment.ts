import { type FetchOptions, osmFetch } from "../_osmFetch";

/** Add a comment to a changeset. The changeset must be closed. */
export async function createChangesetComment(
  changesetId: number,
  commentText: string,
  options?: FetchOptions
): Promise<void> {
  await osmFetch(`/0.6/changeset/${changesetId}/comment`, undefined, {
    ...options,
    method: "POST",
    body: `text=${encodeURIComponent(commentText)}`,
    headers: {
      ...options?.headers,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  });
}
