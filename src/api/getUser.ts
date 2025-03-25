import type { OsmOwnUser, OsmUser, OsmUserBlock } from "../types";
import { type FetchOptions, osmFetch } from "./_osmFetch";

export async function getUser(
  user: number,
  options?: FetchOptions
): Promise<OsmUser>;
export async function getUser(
  user: "me",
  options?: FetchOptions
): Promise<OsmOwnUser>;

export async function getUser(
  user: number | "me",
  options?: FetchOptions
): Promise<OsmUser | OsmOwnUser> {
  const raw = await osmFetch<{ user: OsmUser | OsmOwnUser }>(
    `/0.6/user/${user === "me" ? "details" : user}.json`,
    undefined,
    options
  );

  return {
    ...raw.user,
    account_created: new Date(raw.user.account_created),
  };
}

export async function getUsers(
  users: number[],
  options?: FetchOptions
): Promise<OsmUser[]> {
  const raw = await osmFetch<{ users: OsmUser[] }>(
    "/0.6/users",
    { users },
    options
  );

  return raw.users.map((u) => ({
    ...u,
    account_created: new Date(u.account_created),
  }));
}

/** gets details about a DWG block given the ID of the block */
export async function getUserBlockById(
  blockId: number,
  options?: FetchOptions
): Promise<OsmUserBlock> {
  const raw = await osmFetch<{ user_block: OsmUserBlock }>(
    `/0.6/user_blocks/${blockId}.json`,
    undefined,
    options
  );

  return raw.user_block;
}

/** lists any blocks that are currently active for the authenticated user */
export async function getOwnUserBlocks(
  options?: FetchOptions
): Promise<OsmUserBlock[]> {
  const raw = await osmFetch<{ user_blocks: OsmUserBlock[] }>(
    "/0.6/user/blocks/active",
    undefined,
    options
  );

  return raw.user_blocks;
}
