import type { OsmMessage } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";

export async function getMessage(
  messageId: number,
  options?: FetchOptions
): Promise<OsmMessage> {
  const raw = await osmFetch<{ message: OsmMessage }>(
    `/0.6/user/messages/${messageId}.json`,
    undefined,
    options
  );

  return raw.message;
}
