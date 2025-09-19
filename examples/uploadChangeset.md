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
  },
  {
    // optional callbacks and options, see below for details
    onChunk: () => {},
  }
);
```

Response:

```jsonc
{
  // 12345 is the changeset number
  "12345": {
    // the contents of this object is the diff result.
    // - for created features, this object allows you to map the temporary ID used by the uploader, to the permananet ID that the server allocated to this feature.
    // - for updated & deleted features, it includes the new version number
  },
}
```

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

## Advanced Options

You typically won't need to configure these options, but they exist for advanced users:

## disableCompression

By default, uploads are compressed with [gzip](https://en.wikipedia.org/wiki/Gzip) using JavaScript's native [`CompressionStream` API](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream), if it's available.
This will marginally reduce the bandwidth used for uploads, see [openstreetmap/operations#193](https://github.com/openstreetmap/operations/issues/193) for context.
If you don't want to use gzip compression for uploads, you can set this `disableCompression` option to `false`.

### onChunk

Some changesets are too big to upload, since the API has a restriction of 10,000
features per changeset (_at the time of writing. This limit could change_).
Therefore, these changesets are intelligently split ("chunked") into multiple changesets by this library.

When this happens, you can customize the changeset tags for each chunk by specifying the `onChunk` callback.
This callback is invoked once, if your upload must be chunked.
The callback should return an object of `Tags`.

Example:

```js
await uploadChangeset(changesetTags, diff, {
  onChunk: () => {
    // this is called when the upload was chunked
    return { review_requested: "yes" }; // you can add any tags to the changeset here
  },
});
```

### onProgress

`onProgress` is a callback function which is called whenever the upload progress changes.
It is called with an object parameter:

```js
{
    phase: "upload",
    step: 20,
    total: 35,
}
```

`step` is a number from `0` to `total` which could be used to render a progress bar.
