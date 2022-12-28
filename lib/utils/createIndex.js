import { convertYamlToJson } from "./convertYamlToJson.js";
import { gatherSourceFileDirectories } from "./gatherSourceFileDirectories.js";
import { Content } from "../db/models/content.js";
import { sequelize } from "../db/sequelize.js";
import { l } from "./logger.js";
export async function createIndex() {
    l("creating index...");
    // ensure our db exists
    await sequelize.sync();
    // get a list of all our directories
    const directories = await gatherSourceFileDirectories();
    // convert yaml files in these dirs to a JS object (in memory)
    const content = [];
    directories.forEach(async (path) => {
        console.log(`Reading from ${path}`);
        const json = convertYamlToJson(path);
        content.push(json);
    });
    // write to sqlite db
    try {
        await Content.bulkCreate(content, {
            ignoreDuplicates: true,
        });
    }
    catch (e) {
        console.log("failed... probably due to hash collision");
        console.log(e);
    }
}
