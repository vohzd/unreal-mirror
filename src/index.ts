import { convertYamlToJson } from "./utils/convertYamlToJson.js";
import { gatherSourceFileDirectories } from "./utils/gatherSourceFileDirectories.js";

import { Map } from "./db/models/map.js";
import { sequelize } from "./db/sequelize.js";
console.log(`
*******************************
***** UNREAL FILE FINDER ******
*******************************
`);


(async () => {

  // ensure our db exists
  await sequelize.sync();

  // get a list of all our directories
  const directories = await gatherSourceFileDirectories()


  // convert yaml files in these dirs to a JS object (in memory)
  const metadata = [];

  directories.forEach(async (path) => {
    console.log(`Reading from ${path}`);
    const json = convertYamlToJson(path)

    if (json.contentType === "MAP") {
      metadata.push(json)
    }

  })

  console.log("PARSED METADATA!");
  console.log(metadata);
  // write to sqlite db

  Map.bulkCreate(metadata);

  // created everything, now dump them
  console.log("bulk create finished...");
  console.log("reading..");
  const maps = await Map.findAll();
  console.log(JSON.stringify(maps));

})();


