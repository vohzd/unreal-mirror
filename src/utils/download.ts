
import { Map } from "../db/models/map.js";
// import { MapPack } from "../db/models/mapPack.js";
// import { Model } from "../db/models/model.js";
// import { Mutator } from "../db/models/mutator.js";
// import { Skin } from "../db/models/skin.js";
// import { Voice } from "../db/models/voice.js";

import { sequelize } from "../db/sequelize.js";
import { defineContentPath } from "./defineContentPath.js";
import { l } from "./logger.js";


type Map = {
  downloads: string[]
}

export async function downloadAll() {
  l("DOWNLOADINg!")
  // ensure our db exists
  await sequelize.sync();


  const maps = await Map.findAll({
    where: {
      downloaded: 0
    },
    limit: 2,
    raw: true
  })


  // const parsed = JSON.parse(maps);

  // todo, add sequelize types
  maps.forEach((item: any) => {
    const contentPath = defineContentPath({ ...item, contentType: "map" })

    console.log(JSON.parse(item.downloads));

    // const { url } = item.downloads?.find((downloadPath) => {
    //   return downloadPath?.url?.includes("f002.backblazeb2.com") ||
    //     downloadPath?.url?.includes("unreal-archive-files.eu-central-1.linodeobjects.com") ||
    //     downloadPath?.url?.includes("files.vohzd.com/unrealarchive")
    // })

    // console.log(contentPath);
  })






}
