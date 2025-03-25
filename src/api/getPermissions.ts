import type { OsmOAuth2Scopes } from "../auth/types";
import { type FetchOptions, osmFetch } from "./_osmFetch";

export type Permissions = {
  permissions: `allow_${OsmOAuth2Scopes}`[];
};

/** Gets the OAuth scopes that this app has access to. */
export async function getPermissions(
  options?: FetchOptions
): Promise<Permissions> {
  return osmFetch<Permissions>("/0.6/permissions.json", undefined, options);
}
