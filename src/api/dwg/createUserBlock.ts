import type { OsmUserBlock } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";

/** DWG only */
export async function createUserBlock(
  qs: {
    user: number;
    reason: string;
    period: number;
    needs_view: boolean;
  },
  options?: FetchOptions
): Promise<OsmUserBlock> {
  const result = await osmFetch<{ user_block: OsmUserBlock }>(
    "/0.6/user_blocks.json",
    qs,
    { ...options, method: "POST" }
  );
  return result.user_block;
}
