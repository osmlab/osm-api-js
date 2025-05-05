import type { Tags } from "./general";

/**
 * for explanations, see the {@link https://www.openstreetmap.org/traces/mine GPX trace upload page}
 * or {@link https://osm.wiki/Visibility_of_GPS_traces this wiki page}.
 */
export type GpxVisibility = "public" | "private" | "trackable" | "identifiable";

export interface GpxUploadPayload {
  /** The `.gpx` file, or a `.tar`/`.tar.gz`/`.zip` containing multiple gpx files */
  file: string;
  /** file description */
  description: string;
  tags?: Tags;
  visibility: GpxVisibility;
}

export interface GpxTrackPoint {
  time: string;
  lat: number;
  lon: number;
}
export type GpxTrackSegment = GpxTrackPoint[];

export interface GpxTrack {
  name: string;
  description: string;
  url: string;
  trkseg: GpxTrackSegment[];
}

export interface GpxRoot {
  metadata: Tags;
  trk: GpxTrack[];
}

export interface GpxFile {
  metadata: Tags;
  gpx: GpxRoot[];
}

export interface ParsedAndRaw<T> {
  /** the raw XML file */
  raw: string;
  /** the parsed JSON equivilant */
  parsed: T;
}
