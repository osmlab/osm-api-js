/* eslint-disable unicorn/prevent-abbreviations -- db is not ambiguous */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OsmChange, OsmFeature, OsmFeatureType } from "../../../types";
import { uploadChangeset } from "../uploadChangeset";
import { chunkOsmChange } from "../chunkOsmChange";
import { osmFetch } from "../../_osmFetch";
import { version } from "../../../../package.json";
import { parseOsmChangeXml } from "../_parseOsmChangeXml";
import type { RawUploadResponse } from "../../_rawResponse";

vi.mock("../../_osmFetch");

/**
 * mocks the OSM API, should behave the same
 * for uploading/downloading features.
 */
class MockDatabase {
  #nextId: Partial<Record<OsmFeatureType | "changeset", number>> = {};

  #db: OsmFeature[];

  getNextId(type: OsmFeatureType | "changeset") {
    this.#nextId[type] ||= 0;
    return ++this.#nextId[type];
  }

  constructor(db: OsmFeature[] = []) {
    this.#db = structuredClone(db);
  }

  getFeature(type: OsmFeatureType, ids: number[]) {
    return {
      elements: this.#db.filter((x) => x.type === type && ids.includes(x.id)),
    };
  }

  onUpload = vi.fn((_osmChange: OsmChange) => {
    const osmChange = structuredClone(_osmChange);
    const response: RawUploadResponse = {
      diffResult: [{ $: { generator: "", version: "" } }],
    };

    // create is easy. just need to allocate a new ID
    this.#db.push(
      ...osmChange.create.map((feature) => {
        const oldId = feature.id;
        const newId = this.getNextId(feature.type);

        feature.version = 1;

        response.diffResult[0][feature.type] ||= [];
        response.diffResult[0][feature.type]!.push({
          $: {
            old_id: `${oldId}`,
            new_id: `${newId}`,
            new_version: `${feature.version}`,
          },
        });
        return { ...feature, id: newId };
      })
    );

    // modify & delete needs to check for conflicts
    for (const type of <const>["modify", "delete"]) {
      for (const local of osmChange[type]) {
        const remoteIndex = this.#db.findIndex(
          (x) => x.type === local.type && x.id === local.id
        );
        const remote = this.#db[remoteIndex];

        const diffId = `${local.type[0]}${local.id}@(${local.version}…${remote?.version || ""})`;

        if (!remote) throw new Error(`404 ${local.type}/${local.id}`);
        if (remote.version !== local.version) {
          throw Object.assign(new Error(`409 ${diffId}`), { cause: 409 });
        }

        local.version++;

        response.diffResult[0][local.type] ||= [];
        response.diffResult[0][local.type]!.push({
          $: {
            old_id: `${local.id}`,
            new_id: `${local.id}`,
            new_version: `${local.version}`,
          },
        });

        if (type === "delete") {
          this.#db.splice(remoteIndex, 1);
        } else {
          this.#db[remoteIndex] = local;
        }
      }
    }

    return response;
  });

  onRequest: typeof osmFetch = async <T>(
    url: string,
    _qs: unknown,
    options?: RequestInit
  ): Promise<T> => {
    if (url.endsWith("/create")) return <T>this.getNextId("changeset");

    if (url.endsWith("/close")) return <T>undefined;

    if (url.endsWith("/upload")) {
      let xml;
      if ("Content-Encoding" in options!.headers!) {
        const stream = new Response(options?.body).body!.pipeThrough(
          new DecompressionStream("gzip")
        );
        xml = await new Response(stream).text();
      } else {
        xml = <string>options!.body;
      }
      const json = parseOsmChangeXml(xml);
      return this.onUpload(json) as T;
    }

    const getMatch = url.match(/(node|way|relation)s\.json/)?.[1];
    if (getMatch) {
      return <T>(
        this.getFeature(
          <OsmFeatureType>getMatch,
          new URLSearchParams(url.split("?")[1])
            .get(`${getMatch}s`)!
            .split(",")
            .map(Number)
        )
      );
    }

    // update changeset tags
    if (/\/0.6\/changeset\/(\d+)/.test(url)) return <T>undefined;

    throw new Error(`invalid request ${url}`);
  };
}

let db: MockDatabase;

/** useless props */
const JUNK: Omit<OsmFeature, "id" | "type" | "version"> = {
  changeset: -1,
  timestamp: "",
  uid: -1,
  user: "",
};

const MOCK_FEATURES: OsmFeature[] = [
  { ...JUNK, type: "node", id: 1, version: 1, lat: 0, lon: 0 },
  { ...JUNK, type: "node", id: 2, version: 2, lat: 0, lon: 0 },
  { ...JUNK, type: "way", id: 1, version: 2, nodes: [1, 2] },
  { ...JUNK, type: "way", id: 2, version: 1, nodes: [2, 1] },
  {
    ...JUNK,
    type: "relation",
    id: 1,
    version: 10,
    members: [{ ref: 1, type: "node", role: "" }],
  },
  {
    ...JUNK,
    type: "relation",
    id: 2,
    version: 21,
    members: [{ ref: 1, type: "way", role: "outer" }],
  },
  {
    ...JUNK,
    type: "relation",
    id: 3,
    version: 1,
    members: [{ ref: 1, type: "way", role: "outer" }],
  },
  {
    ...JUNK,
    type: "relation",
    id: 4,
    version: 1,
    members: [{ ref: 1, type: "way", role: "outer" }],
  },

  // these are already deleted in the database:
  { ...JUNK, type: "node", id: 3, version: 2, lat: 0, lon: 0, visible: false },
];

describe("uploadChangeset", () => {
  beforeEach(() => {
    db = new MockDatabase(MOCK_FEATURES);
    vi.mocked(osmFetch).mockImplementation(db.onRequest);
    vi.clearAllMocks();
    chunkOsmChange.DEFAULT_LIMIT = 6; // don't do this in production
  });

  const huge: OsmChange = {
    create: [
      {
        ...JUNK,
        type: "relation",
        id: -300000,
        version: 1,
        members: [{ ref: -3, type: "way", role: "inner" }],
      },
      { ...JUNK, type: "node", id: -100, version: 1, lat: 0, lon: 0 },
      { ...JUNK, type: "way", id: -3, version: 1, nodes: [-100, -2] },
      { ...JUNK, type: "node", id: -4, version: 1, lat: 0, lon: 0 },
      { ...JUNK, type: "node", id: -5, version: 1, lat: 0, lon: 0 },
      { ...JUNK, type: "node", id: -6, version: 1, lat: 0, lon: 0 },
      { ...JUNK, type: "node", id: -7, version: 1, lat: 0, lon: 0 },
      { ...JUNK, type: "node", id: -2, version: 1, lat: 0, lon: 0 },
      { ...JUNK, type: "node", id: -8, version: 1, lat: 0, lon: 0 },
      { ...JUNK, type: "node", id: -9, version: 1, lat: 0, lon: 0 },
      { ...JUNK, type: "node", id: -10, version: 1, lat: 0, lon: 0 },
      { ...JUNK, type: "node", id: -11, version: 1, lat: 0, lon: 0 },
    ],
    modify: [
      { ...JUNK, type: "node", id: 1, version: 1, lat: 0, lon: 0 },
      { ...JUNK, type: "relation", id: 1, version: 10, members: [] },
      { ...JUNK, type: "way", id: 1, version: 2, nodes: [600, 601] },
    ],
    delete: [
      { ...JUNK, type: "relation", id: 2, version: 21, members: [] },
      { ...JUNK, type: "node", id: 2, version: 2, lat: 0, lon: 0 },
      { ...JUNK, type: "relation", id: 3, version: 1, members: [] },
      { ...JUNK, type: "way", id: 2, version: 1, nodes: [600, 601] },
      { ...JUNK, type: "relation", id: 4, version: 1, members: [] },
    ],
  };

  it("adds a fallback created_by tag", async () => {
    const output = await uploadChangeset(
      { comment: "added a building" },
      { create: [], modify: [], delete: [] }
    );
    expect(output).toStrictEqual({ 1: { diffResult: {} } });

    expect(osmFetch).toHaveBeenCalledTimes(3);
    expect(osmFetch).toHaveBeenNthCalledWith(
      1,
      "/0.6/changeset/create",
      undefined,
      expect.objectContaining({
        body: `<osm>
  <changeset>
    <tag k="comment" v="added a building"/>
    <tag k="created_by" v="osm-api-js ${version}"/>
  </changeset>
</osm>
`,
      })
    );
  });

  it("splits changesets into chunks and uploads them in a schematically valid order", async () => {
    const output = await uploadChangeset({ created_by: "me" }, huge);

    expect(osmFetch).toHaveBeenCalledTimes(12);

    for (const index of [0, 1, 2, 3]) {
      expect(osmFetch).toHaveBeenNthCalledWith(
        1 + 3 * index, // 3 API requests per changeset
        "/0.6/changeset/create",
        undefined,
        expect.objectContaining({
          body: `<osm>
  <changeset>
    <tag k="created_by" v="me"/>
    <tag k="chunk" v="${index + 1}/4"/>
  </changeset>
</osm>
`,
        })
      );
    }

    expect(output).toStrictEqual({
      // create nodes first.
      1: {
        diffResult: {
          node: {
            "-10": { newId: 2, newVersion: 1 },
            "-11": { newId: 1, newVersion: 1 },
            "-2": { newId: 5, newVersion: 1 },
            "-7": { newId: 6, newVersion: 1 },
            "-8": { newId: 4, newVersion: 1 },
            "-9": { newId: 3, newVersion: 1 },
          },
        },
      },
      // create nodes then ways then relations next
      2: {
        diffResult: {
          node: {
            "-100": { newId: 10, newVersion: 1 },
            "-4": { newId: 9, newVersion: 1 },
            "-5": { newId: 8, newVersion: 1 },
            "-6": { newId: 7, newVersion: 1 },
          },
          relation: { "-300000": { newId: 1, newVersion: 1 } },
          way: { "-3": { newId: 1, newVersion: 1 } },
        },
      },
      // modify and delete next (any order)
      3: {
        diffResult: {
          node: {
            1: { newId: 1, newVersion: 2 },
            2: { newId: 2, newVersion: 3 },
          },
          relation: {
            2: { newId: 2, newVersion: 22 },
            3: { newId: 3, newVersion: 2 },
            4: { newId: 4, newVersion: 2 },
          },
          way: { 2: { newId: 2, newVersion: 2 } },
        },
      },
      // delete last
      4: {
        diffResult: {
          relation: { 1: { newId: 1, newVersion: 11 } },
          way: { 1: { newId: 1, newVersion: 3 } },
        },
      },
    });
  });

  it("splits changesets into chunks and suports a custom tag function", async () => {
    const output = await uploadChangeset({ created_by: "me" }, huge, {
      onChunk: ({ changesetIndex, changesetTotal, featureCount }) => ({
        comment: "hiiii",
        created_by: "MyCoolApp",
        part: `${changesetIndex + 1} out of ${changesetTotal}`,
        totalSize: featureCount.toLocaleString("en"),
      }),
    });

    expect(osmFetch).toHaveBeenCalledTimes(12);

    for (const index of [0, 1, 2, 3]) {
      expect(osmFetch).toHaveBeenNthCalledWith(
        1 + 3 * index, // 3 API requests per changeset
        "/0.6/changeset/create",
        undefined,
        expect.objectContaining({
          body: `<osm>
  <changeset>
    <tag k="comment" v="hiiii"/>
    <tag k="created_by" v="MyCoolApp"/>
    <tag k="part" v="${index + 1} out of 4"/>
    <tag k="totalSize" v="20"/>
  </changeset>
</osm>
`,
        })
      );
    }

    // don't need to assert the output, since it's the same
    // as the previous test case.
    expect(Object.keys(output).map(Number)).toStrictEqual([1, 2, 3, 4]);
  });

  // end of tests
});
