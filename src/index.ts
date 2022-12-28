
import { createIndex } from "./utils/createIndex.js";
import { downloadAll } from "./utils/download.js";
console.log(`
*******************************
***** UNREAL FILE FINDER ******
*******************************
`);

(async () => {

  const arg = process.argv[2]

  if (arg === "--createIndex") {
    await createIndex();
  }
  if (arg === "--downloadAll") {
    console.log("downloading all...");
    await downloadAll();

  }






})();


