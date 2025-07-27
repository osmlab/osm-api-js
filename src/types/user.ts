export type OsmUserRole = "administrator" | "moderator" | "importer";

export type OsmUser = {
  id: number;
  display_name: string;
  account_created: Date;
  description: string;
  contributor_terms: { agreed: boolean; pd: boolean };
  /** may be undefined if the user has no profile photo */
  img?: { href: string };
  roles: OsmUserRole[];
  changesets: { count: number };
  traces: { count: number };
  blocks: { received: { count: number; active: number } };
};

export type OsmOwnUser = OsmUser & {
  home: { lat: number; lon: number; zoom: number };
  languages: string[];
  messages: {
    received: { count: number; unread: number };
    sent: { count: number };
  };
};

export interface OsmUserBlock {
  id: number;
  /** ISO Date */
  created_at: string;
  /** ISO Date */
  updated_at: string;
  /** ISO Date */
  ends_at: string;
  needs_view: boolean;
  user: { uid: number; user: string };
  creator: { uid: number; user: string };
  /** field only exists if the block has already been revoked */
  revoker?: { uid: number; user: string };
  reason: string;
}
