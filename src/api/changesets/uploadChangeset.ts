import type { OsmChange, OsmFeatureType, Tags } from "../../types";
import { type FetchOptions, osmFetch } from "../_osmFetch";
import { version } from "../../../package.json";
import type { RawUploadResponse } from "../_rawResponse";
import {
  createChangesetMetaXml,
  createOsmChangeXml,
} from "./_createOsmChangeXml";
import { chunkOsmChange, getOsmChangeSize } from "./chunkOsmChange";

export interface UploadChunkInfo {
  /** the total number of features being uploaded (counting all chunks) */
  featureCount: number;

  /** the index of this changeset (the first is 0) */
  changesetIndex: number;
  /** the number of changesets required for this upload */
  changesetTotal: number;
}

export type UploadPhase = "upload" | "merge_conflicts";

/** Can include multiple changeset IDs if the upload was chunked. */
export interface UploadResult {
  [changesetId: number]: {
    diffResult: {
      [Type in OsmFeatureType]?: {
        [oldId: number]: {
          newId: number;
          newVersion: number;
        };
      };
    };
  };
}

/** @internal */
export function compress(input: string) {
  // check if it's supported
  if (!globalThis.CompressionStream) return undefined;

  const stream = new Response(input).body!.pipeThrough(
    new CompressionStream("gzip")
  );
  return new Response(stream).blob();
}

export interface UploadOptions {
  /**
   * Some changesets are too big to upload, so they have to be
   * split ("chunked") into multiple changesets.
   * When this happens, you can customize the changeset tags for
   * each chunk by returning {@link Tags}.
   */
  onChunk?(info: UploadChunkInfo): Tags;

  /**
   * Optional, if you want status updates during the upload process,
   * this callback is invoked whenever the progress updates.
   */
  onProgress?(progress: {
    phase: UploadPhase;
    step: number;
    total: number;
  }): void;

  /** by default, uploads are compressed with gzip. set to `false` to disable */
  disableCompression?: boolean;
}

/**
 * uploads a changeset to the OSM API.
 * @returns the changeset number
 */
export async function uploadChangeset(
  tags: Tags,
  diff: OsmChange,
  options?: FetchOptions & UploadOptions
): Promise<UploadResult> {
  const {
    onChunk,
    onProgress,
    disableCompression,
    //
    ...fetchOptions
  } = options || {};

  const chunks = chunkOsmChange(diff);
  const featureCount = getOsmChangeSize(diff);

  const result: UploadResult = {};

  for (const [index, chunk] of chunks.entries()) {
    let tagsForChunk = tags;

    // if this is a chunk of an enourmous changeset, the tags
    // for each chunk get custom tags
    if (chunks.length > 1) {
      if (onChunk) {
        // there is a custom implementation for tags.
        tagsForChunk = onChunk({
          featureCount,
          changesetIndex: index,
          changesetTotal: chunks.length,
        });
      } else {
        // there is no custom implementation,
        // so add some default tags to the changeset.
        tagsForChunk["chunk"] = `${index + 1}/${chunks.length}`;
      }
    }

    // if the user didn't include a `created_by` tag, we'll add one.
    tagsForChunk["created_by"] ||= `osm-api-js ${version}`;

    onProgress?.({ phase: "upload", step: index + 1, total: chunks.length });

    const csId = +(await osmFetch<string>("/0.6/changeset/create", undefined, {
      ...fetchOptions,
      method: "PUT",
      body: createChangesetMetaXml(tagsForChunk),
      headers: {
        ...fetchOptions.headers,
        "content-type": "application/xml; charset=utf-8",
      },
    }));

    const osmChangeXml = createOsmChangeXml(csId, chunk);

    const compressed = !disableCompression && (await compress(osmChangeXml));

    const idMap = await osmFetch<RawUploadResponse>(
      `/0.6/changeset/${csId}/upload`,
      undefined,
      {
        ...fetchOptions,
        method: "POST",
        body: compressed || osmChangeXml,
        headers: {
          ...fetchOptions.headers,
          ...(compressed && { "Content-Encoding": "gzip" }),
          "content-type": "application/xml; charset=utf-8",
        },
      }
    );

    // convert the XML format into a more concise JSON format
    result[csId] = { diffResult: {} };
    for (const _type in idMap.diffResult[0]) {
      if (_type === "$") continue;
      const type = <OsmFeatureType>_type;
      const items = idMap.diffResult[0][type] || [];
      for (const item of items) {
        result[csId].diffResult[type] ||= {};
        result[csId].diffResult[type][item.$.old_id] = {
          newId: +item.$.new_id,
          newVersion: +item.$.new_version,
        };
      }
    }

    await osmFetch(`/0.6/changeset/${csId}/close`, undefined, {
      ...fetchOptions,
      method: "PUT",
    });
  }

  return result;
}
