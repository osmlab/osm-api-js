import { describe, expect, it } from "vitest";
import { createOsmChangeXml } from "../_createOsmChangeXml";
import type { OsmChange } from "../../../types";

const boilerplate = <const>{
  changeset: 0,
  timestamp: "",
  uid: 0,
  user: "",
  version: 0,
};

describe("_createOsmChangeXml", () => {
  it("generates XML from the JSON", () => {
    const osmChange: OsmChange = {
      create: [
        {
          type: "node",
          id: -1,
          ...boilerplate,
          lat: -36,
          lon: 174,
          tags: { amenity: "cafe", name: "Café Contigo" },
        },
      ],
      modify: [
        {
          type: "way",
          id: -2,
          ...boilerplate,
          nodes: [10, 11, 12, 13, 10],
          tags: { building: "yes" },
        },
      ],
      delete: [
        { type: "node", id: 15, ...boilerplate, lat: 0, lon: 0 },
        { type: "relation", id: 101, ...boilerplate, members: [] },
        { type: "node", id: 16, ...boilerplate, lat: 0, lon: 0 },
        {
          type: "way",
          id: 3,
          ...boilerplate,
          nodes: [15, 16, 17, 18, 15],
          tags: { building: "yes" },
        },
        { type: "node", id: 17, ...boilerplate, lat: 0, lon: 0 },
        { type: "node", id: 18, ...boilerplate, lat: 0, lon: 0 },
      ],
    };
    const xml = createOsmChangeXml(123, osmChange, {
      created_by: "me",
      comment: "add café",
    });
    expect(xml).toMatchInlineSnapshot(`
      "<osmChange version="0.6" generator="osm-api-js">
        <changeset>
          <tag k="created_by" v="me"/>
          <tag k="comment" v="add café"/>
        </changeset>
        <create>
          <node id="-1" version="0" changeset="123" lat="-36" lon="174">
            <tag k="amenity" v="cafe"/>
            <tag k="name" v="Café Contigo"/>
          </node>
        </create>
        <modify>
          <way id="-2" version="0" changeset="123">
            <tag k="building" v="yes"/>
            <nd ref="10"/>
            <nd ref="11"/>
            <nd ref="12"/>
            <nd ref="13"/>
            <nd ref="10"/>
          </way>
        </modify>
        <delete if-unused="true">
          <relation id="101" version="0" changeset="123"/>
          <way id="3" version="0" changeset="123">
            <tag k="building" v="yes"/>
            <nd ref="15"/>
            <nd ref="16"/>
            <nd ref="17"/>
            <nd ref="18"/>
            <nd ref="15"/>
          </way>
          <node id="15" version="0" changeset="123" lat="0" lon="0"/>
          <node id="16" version="0" changeset="123" lat="0" lon="0"/>
          <node id="17" version="0" changeset="123" lat="0" lon="0"/>
          <node id="18" version="0" changeset="123" lat="0" lon="0"/>
        </delete>
      </osmChange>
      "
    `);
  });
});
