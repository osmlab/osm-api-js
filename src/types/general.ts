declare global {
  namespace OsmApi {
    /**
     * use this interface to get additional typesafety, see the documentation
     * on {@link Key} for more info.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentional
    interface Keys {}
  }
}

/**
 * By default, this library defines {@link Tags} to be `Record<string, string>`. This
 * means that you don't get any typesafety for OSM keys/tags.
 *
 * There are two methods to make this more strict:
 *
 * 1. enable TypeScript's `noPropertyAccessFromIndexSignature` along with eslint's `dot-notation`.
 *    This is not perfect, but it will force you to use `tags[KEY]` instead of `tags.key` which
 *    makes the hardcoded keys more visible.
 *
 * 2. Declare a string union for every permitted osm key. For example:
 *    ```ts
 *    declare global {
 *      namespace OsmApi {
 *        interface Keys {
 *          keys: 'amenity' | 'highway';
 *        }
 *      }
 *    }
 *    export {};
 *    ```
 *
 * Regardless of what method you use, it also makes sense to enable TypeScript's
 * `noUncheckedIndexedAccess` option.
 */
export type Key = OsmApi.Keys extends { keys: string }
  ? OsmApi.Keys["keys"]
  : string;

export type Tags = OsmApi.Keys extends { keys: string }
  ? Partial<Record<Key, string>>
  : Record<string, string>;

export type BBox = readonly [
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number,
];
