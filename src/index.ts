
import { createIndex } from "./utils/createIndex.js";
import { download } from "./utils/download.js";
console.log(`
*******************************
***** UNREAL FILE FINDER ******
*******************************
`);

const test = 'yet'

(async () => {
  const arg = process.argv[2]
  if (arg === "--createIndex") {
    await createIndex();
  }
  if (arg === "--download") {
    console.log("downloading all...");
    await download();
    setInterval(async () => {
      console.log("next batch...");
      await download();
    }, 20000)
  }
})();


