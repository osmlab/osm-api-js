# uploadChangeset

```ts
import { uploadChangeset } from "osm-api";

await uploadChangeset(
  {
    // tags
    created_by: "iD",
    comment: "change surface to unpaved",
  },
  {
    // OsmDiff
    create: [
      /* list of `OsmFeature`s */
    ],
    modify: [],
    delete: [],
  }
);
```

Response:

```json
12345
```

(changeset number)

## Detailed Examples

### Updating existing features

```ts
import { getFeature } from "osm-api";

const [feature] = await getFeature("node", 12345);

feature.tags ||= {};
feature.tags.amenity = "restaurant";

await uploadChangeset(
  { created_by: "MyApp 1.0", comment: "tagging as resturant" },
  { create: [], modify: [feature], delete: [] }
);
```

### Creating new features

To create a new node, several of the fields will have be be blanked out

```ts
import { OsmNode } from "osm-api";

const newNode: OsmNode = {
  type: "node",
  lat: 123.456,
  lon: 789.123,
  tags: {
    amenity: "restaurant",
  },
  id: -1, // Negative ID for new features

  changeset: -1,
  timestamp: "",
  uid: -1,
  user: "",
  version: 0,
};

await uploadChangeset(
  { created_by: "MyApp 1.0", comment: "created a restaurant" },
  { create: [newNode], modify: [], delete: [] }
);
```

## Note about ordering

When accessing the API directly, the order of items in `create`/`modify`/`delete` array matters.
However, if you use this library, you don't need to worry about the order.
This library will sort your changeset items before uploading it, so you send your data to this library in any order.
