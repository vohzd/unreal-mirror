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
  const directories = await gatherSourceFileDirectories()


  await sequelize.sync();

  directories.forEach(async (path) => {
    console.log(`Reading from ${path}`);

    const { contentType, author, description, firstIndex, game, name, releaseDate, attachments, originalFilename, hash, fileSize, files, dependencies, downloads, gametype } = convertYamlToJson(path)

    if (contentType === "MAP") {

      Map.create({
        author, description, firstIndex, game, name, releaseDate, attachments, originalFilename, hash, fileSize, files, dependencies, downloads, gametype
      });
      console.log("dobe,,,,");
    }

  })


  // created everything, now dump them

  const map = await Map.findAll();
  console.log(JSON.stringify(map));
  console.log("found a map!");

})();


