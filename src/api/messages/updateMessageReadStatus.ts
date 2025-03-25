import type { OsmMessage } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";

export async function updateMessageReadStatus(
  messageId: number,
  isRead: boolean,
  options?: FetchOptions
): Promise<OsmMessage> {
  const raw = await osmFetch<{ message: OsmMessage }>(
    `/0.6/user/messages/${messageId}.json`,
    { read_status: isRead },
    { ...options, method: "POST" }
  );

  return raw.message;
}
