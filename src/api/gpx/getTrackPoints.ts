import type { BBox } from "../../types";
import type { GpxFile, ParsedAndRaw } from "../../types/gpx";
import { type FetchOptions, osmFetch } from "../_osmFetch";
import type { RawGpxTrackPoints } from "../_rawResponse";

/**
 * Use this to retrieve the GPS track points that are inside
 * a given bounding box.
 * @param page - for pagination, the first page is 0
 * @returns a JSON representation of the GPX file
 */
export async function getTrackPoints(
  bbox: BBox | string,
  // eslint-disable-next-line default-param-last
  page = 0,
  options?: FetchOptions
): Promise<ParsedAndRaw<GpxFile>> {
  // this is an XML-only API
  const raw = await osmFetch<{ json: RawGpxTrackPoints; xml: string }>(
    "/0.6/trackpoints",
    { bbox, page },
    options
  );

  const parsed: GpxFile = {
    metadata: raw.json["?xml"][0].$,
    gpx: raw.json.gpx.map((gpx) => ({
      metadata: gpx.$,
      trk: gpx.trk.map((trk) => ({
        name: trk.name[0],
        description: trk.desc[0],
        url: trk.url[0],
        trkseg: trk.trkseg.map((trkseg) =>
          trkseg.trkpt.map((trkpt) => ({
            time: trkpt.time[0],
            lat: +trkpt.$.lat,
            lon: +trkpt.$.lon,
          }))
        ),
      })),
    })),
  };

  return { raw: raw.xml, parsed };
}
