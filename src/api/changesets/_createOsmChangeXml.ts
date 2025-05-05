import { XMLBuilder } from "fast-xml-parser";
import type { OsmChange, OsmFeature, Tags } from "../../types";

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "$",
  format: true,
  suppressEmptyNode: true,
  suppressBooleanAttributes: false,
});

/** @internal */
export function createChangesetMetaXml(tags: Tags) {
  return builder.build({
    osm: {
      changeset: {
        tag: Object.entries(tags).map(([$k, $v]) => ({ $k, $v })),
      },
    },
  });
}

const createGroup = (
  csId: number,
  features: OsmFeature[],
  type?: keyof OsmChange
) => {
  const order = ["node", "way", "relation"];
  // delete children before the features that reference them
  if (type === "delete") order.reverse();

  return features.reduce(
    (ac, f) => {
      const base = {
        $id: f.id,
        $version: type === "create" ? 0 : f.version,
        $changeset: csId,
        tag: Object.entries(f.tags || {}).map(([$k, $v]) => ({
          $k,
          $v,
        })),
      };
      switch (f.type) {
        case "node": {
          const feat = { ...base, $lat: f.lat, $lon: f.lon };
          return { ...ac, node: [...ac.node, feat] };
        }
        case "way": {
          if (!f.nodes) throw new Error("Way has no nodes");
          const feat = { ...base, nd: f.nodes.map(($ref) => ({ $ref })) };
          return { ...ac, way: [...ac.way, feat] };
        }
        case "relation": {
          if (!f.members) throw new Error("Relation has no members");
          const feat = {
            ...base,
            member: f.members.map((m) => ({
              $type: m.type,
              $ref: m.ref,
              $role: m.role,
            })),
          };
          return { ...ac, relation: [...ac.relation, feat] };
        }
        default: {
          return ac;
        }
      }
    },
    // construct the object with the keys in the correct order
    Object.fromEntries<unknown[]>(order.map((key) => [key, []])) as {
      node: unknown[];
      way: unknown[];
      relation: unknown[];
    }
  );
};

/**
 * this function also sorts the elements to ensure that deletion
 * works. This means you don't need to worry about the array order
 * yourself.
 * For example, deleting a square building involves deleting 4 nodes
 * and 1 way. The 4 nodes need to be included in the deletions array
 * before the way.
 */
// not marked as internal - this one can be used by consumers
export function createOsmChangeXml(
  csId: number,
  diff: OsmChange,
  metadata?: Tags
): string {
  return builder.build({
    osmChange: {
      $version: "0.6",
      $generator: "osm-api-js",
      changeset: metadata
        ? { tag: Object.entries(metadata).map(([$k, $v]) => ({ $k, $v })) }
        : undefined,
      create: [createGroup(csId, diff.create, "create")],
      modify: [createGroup(csId, diff.modify, "modify")],
      delete: [
        { "$if-unused": true, ...createGroup(csId, diff.delete, "delete") },
      ],
    },
  });
}
