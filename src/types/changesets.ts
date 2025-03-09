import type { OsmFeature } from "./features";

export type ChangesetComment = {
  id: number;
  visible: boolean;
  user: string;
  uid: number;
  date: string;
  text: string;
};

export type Changeset = {
  id: number;
  created_at: string;
  open: boolean;
  comments_count: number;
  changes_count: number;
  /** This property is missing if `open=true` */
  closed_at?: string;
  /** This property is missing if `open=true`, or if none of the edited features have geometry data (see #14) */
  min_lat?: number;
  /** This property is missing if `open=true`, or if none of the edited features have geometry data (see #14) */
  min_lon?: number;
  /** This property is missing if `open=true`, or if none of the edited features have geometry data (see #14) */
  max_lat?: number;
  /** This property is missing if `open=true`, or if none of the edited features have geometry data (see #14) */
  max_lon?: number;
  uid: number;
  user: string;
  tags: {
    [key: string]: string;
  };

  /** the `comments` attribute is only included in the `getChangeset` API */
  comments?: ChangesetComment[];
};

export type OsmChange = {
  create: OsmFeature[];
  modify: OsmFeature[];
  delete: OsmFeature[];
};
