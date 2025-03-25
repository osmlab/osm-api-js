import type { OsmMessageWithoutBody } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";

export async function listMessages(
  type: "inbox" | "outbox",
  options?: FetchOptions
): Promise<OsmMessageWithoutBody[]> {
  const raw = await osmFetch<{ messages: OsmMessageWithoutBody[] }>(
    `/0.6/user/messages/${type}.json`,
    undefined,
    options
  );

  return raw.messages;
}
