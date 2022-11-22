# unreal-mirror

clone this first!
https://github.com/unreal-archive/unreal-archive-data

then run `npm start` for a full index (this will take forever, and download 300GB to disk (58k files)

set `UNREAL_METADATA_PATH` to a smaller folder for a smaller index (and delete all your .json data files)

For example;

```
const UNREAL_METADATA_PATH = '../unreal-archive-data/content/Unreal Tournament/Maps/BunnyTrack'
```
