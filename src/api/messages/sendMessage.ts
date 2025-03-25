import type { OsmMessage } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";

export interface SendMessageOptions {
  /** Recipient user ID. Specify either `recipient` or `recipient_id`. */
  recipient_id?: number;
  /** Recipient's display name. Specify either `recipient` or `recipient_id`. */
  recipient?: string;
  /** The title (subject) of the message. */
  title: string;
  /** Full content and metadata of the updated message in XML or JSON format. */
  body: string;
  /** Format of the body message @default markdown */
  body_format?: OsmMessage["body_format"];
}

export async function sendMessage(
  message: SendMessageOptions,
  options?: FetchOptions
): Promise<OsmMessage> {
  const raw = await osmFetch<{ message: OsmMessage }>(
    "/0.6/user/messages.json",
    message,
    { ...options, method: "POST" }
  );

  return raw.message;
}
