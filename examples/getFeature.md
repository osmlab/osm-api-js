# getFeature

```ts
import { getFeature } from "osm-api";

await getFeature("node", 1234);

// Set `full` to `true` to download the members of the relation and the nodes of any ways.
// This option has no effect for nodes.
await getFeature("relation", 1234, true);
```

Response:

```json
// the response is an array, which will only have 1 item unless you set `full` to `true`
[
  {
    "changeset": 243638,
    "id": 4305800016,
    "nodes": [4332338515, 4332338516, 4332338517, 4332338518, 4332338515],
    "tags": {
      "building": "house",
      "name:fr": "chez moi"
    },
    "timestamp": "2022-09-10T11:47:13Z",
    "type": "way",
    "uid": 12248,
    "user": "example_user",
    "version": 4
  }
]
```
