import type { OsmUserBlock } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";

export async function getUserBlock(
  blockId: number,
  options?: FetchOptions
): Promise<OsmUserBlock> {
  const result = await osmFetch<{ user_block: OsmUserBlock }>(
    `/0.6/user_blocks/${blockId}.json`,
    {},
    options
  );
  return result.user_block;
}
