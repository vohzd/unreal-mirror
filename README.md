# unreal-mirror

This batch downloads items from the unrealarchive.org to disk in a JavaScripty way.

To run, first

`npm install && npm run createIndex` to download the metadata and create a SQLite database.

To commence the downloads themselves;

`npm run download`

The source is written in TypeScript, so change any of the contents of `src/*` then run `npm run compile` to apply your changes.
