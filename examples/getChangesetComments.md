# getChangesetComments

```ts
import { getChangesetComments } from "osm-api";

// see the type-definitions for other filtering options
await getChangesetComments({ display_name: "example_user" });
```

Response:

```json
[
  {
    "id": 123456,
    "visible": true,
    "date": "2018-01-31T12:34:56Z",
    "uid": 1,
    "user": "example_user",
    "text": "woo!"
  }
]
```
