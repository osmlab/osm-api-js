import { beforeAll, describe, expect, it } from "vitest";
import {
  configure,
  getApiCapabilities,
  getCapabilities,
  getChangeset,
  getChangesetDiff,
  getFeature,
  getMessage,
  getNotesForQuery,
  getOwnUserBlocks,
  getPermissions,
  getPreferences,
  getUIdFromDisplayName,
  getUser,
  getUserBlockById,
  listChangesets,
  listMessages,
} from "..";

/**
 * these tests call the real dev API.
 *
 * Only useful for the XML apis that require transformation
 */

const GribblehirstBbox = <const>[
  174.738948, -36.880984, 174.741083, -36.880065,
];

const auth = process.env["OSM_AUTH"] || process.env["VITE_OSM_AUTH"];

describe("end to end tests", () => {
  beforeAll(() => {
    configure({
      apiUrl: "https://master.apis.dev.openstreetmap.org",
      authHeader: auth,
    });
  });

  it("getApiCapabilities", async () => {
    expect(await getApiCapabilities()).toMatchSnapshot();
  });

  it("getCapabilities", async () => {
    expect(await getCapabilities()).toMatchSnapshot();
  });

  it("getPermissions", async () => {
    expect(await getPermissions()).toMatchSnapshot();
  });

  it.each`
    full
    ${true}
    ${false}
  `("getFeature full=$full", async ({ full }) => {
    expect(await getFeature("way", 4305800016, full)).toMatchSnapshot();
  });

  it("getUIdFromDisplayName", async () => {
    expect(await getUIdFromDisplayName("kylenz_testing")).toBe(12248);
  });

  it("getUser", async () => {
    const user = await getUser(12248);
    user.changesets.count = 27; // this shouldn't break the tests
    expect(user).toMatchSnapshot();
  });

  it("listChangesets", async () => {
    expect(
      await listChangesets({
        bbox: GribblehirstBbox,
        display_name: "kylenz_testing",
      })
    ).toMatchSnapshot();
  });

  it("getChangeset (no discussion)", async () => {
    expect(await getChangeset(227200, false)).toMatchSnapshot();
  });

  it("getChangeset (with discussion)", async () => {
    expect(await getChangeset(227200, true)).toMatchSnapshot();
  });

  it("getChangesetDiff", async () => {
    expect(await getChangesetDiff(227200)).toMatchSnapshot();
  });

  it("getNotesForQuery", async () => {
    expect(await getNotesForQuery({ q: "cycleway" })).toMatchSnapshot();
  });

  it("getUserBlockById", async () => {
    expect(await getUserBlockById(1)).toMatchSnapshot();
  });

  (auth ? describe : describe.skip)("APIs requiring authentication", () => {
    it("listMessages", async () => {
      expect(await listMessages("outbox")).toMatchSnapshot();
    });

    it("getMessage", async () => {
      expect(await getMessage(79)).toMatchSnapshot();
    });

    it("getPreferences", async () => {
      expect(await getPreferences()).toMatchSnapshot();
    });

    it("getOwnUserBlocks", async () => {
      expect(await getOwnUserBlocks()).toMatchSnapshot();
    });
  });
});
