
import { outputFile } from 'fs-extra';
import { Content } from "../db/models/content.js";
import { sequelize } from "../db/sequelize.js";
import { defineContentPath } from "./defineContentPath.js";
import { l } from "./logger.js";

export async function downloadAll() {
  l("DOWNLOADINg!")
  // ensure our db exists
  await sequelize.sync();


  const content = await Content.findAll({
    where: {
      downloaded: 0
    },
    limit: 3,
    raw: true
  })


  // const parsed = JSON.parse(maps);

  // todo, add sequelize types
  content.forEach(async (file: any) => {
    const contentPath = defineContentPath(file)

    // choose a decent cdn
    const { url } = JSON.parse(file.downloads).find((downloadPath) => {
      return downloadPath?.url?.includes("f002.backblazeb2.com") ||
        downloadPath?.url?.includes("unreal-archive-files.eu-central-1.linodeobjects.com") ||
        downloadPath?.url?.includes("files.vohzd.com/unrealarchive")
    })

    l(`Downloading ${file.name} from ${url}`)
    try {
      if (url) {
        // annoyingly, fetch doesnt support HTTP2 so random requests fail!
        const res = await fetch(url)
        const binary = await res.arrayBuffer()
        outputFile(`${contentPath}/${file.originalFilename}`, Buffer.from(new Uint8Array(binary)))
        const record = await Content.findOne({
          where: {
            hash: file.hash
          }
        })
        record.set("downloaded", 1)
        record.save();
        console.log(record);

        l(`Finished downloading ${file.name}`)
      }
      else l(`NO VALID URL`)
    }
    catch (e) {
      l(`FAILED DOWNLOAD: ${url}`)
      console.log(e);
    }

  })
}
