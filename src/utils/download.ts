import { outputFile } from "fs-extra";
import { Content } from "../db/models/content.js";
import { sequelize } from "../db/sequelize.js";
import { defineContentPath } from "./defineContentPath.js";
import { l } from "./logger.js";

export async function download() {
  // ensure our db exists
  await sequelize.sync();

  const content = await Content.findAll({
    where: {
      downloaded: 0,
    },
    limit: 50,
  });

  // todo, add sequelize types
  content.forEach(async (file: any) => {
    // hack until i figure out how to just get the data of the instance...
    const parsed = JSON.parse(JSON.stringify(file));
    const contentPath = defineContentPath(parsed);
    if (!parsed.downloads) {
      return;
    }

    // choose a random index between 1 and 3, so we don't DoS the server
    const randomIndex = Math.floor(Math.random() * (3 - 1 + 1) + 1);
    const url = parsed.downloads[randomIndex]?.url || parsed.downloads[0]?.url;

    l(`Downloading ${file.name} from ${url}`);
    try {
      if (url) {
        // annoyingly, fetch doesnt support HTTP2 so random requests fail!
        const res = await fetch(url);
        const binary = await res.arrayBuffer();
        outputFile(`${contentPath}/${file.originalFilename}`, Buffer.from(new Uint8Array(binary)));
        file.update({ downloaded: 1 });
        l(`Finished downloading ${file.name} from ${url}`);
      } else l(`NO VALID URL`);
    } catch (e) {
      l(`FAILED DOWNLOAD: ${url}`);
      console.log(e);
    }
  }); // end loop
}
