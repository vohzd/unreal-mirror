import { convertYamlToJson } from "./convertYamlToJson.js";
import { gatherSourceFileDirectories } from "./gatherSourceFileDirectories.js";
import { Map } from "../db/models/map.js";
import { MapPack } from "../db/models/mapPack.js";
import { Model } from "../db/models/model.js";
import { Mutator } from "../db/models/mutator.js";
import { Skin } from "../db/models/skin.js";
import { Voice } from "../db/models/voice.js";
import { sequelize } from "../db/sequelize.js";
import { l } from "./logger.js";
export async function createIndex() {
    l("creating index...");
    // ensure our db exists
    await sequelize.sync();
    // get a list of all our directories
    const directories = await gatherSourceFileDirectories();
    // convert yaml files in these dirs to a JS object (in memory)
    const maps = [];
    const mapPacks = [];
    const mutators = [];
    const models = [];
    const skins = [];
    const voices = [];
    directories.forEach(async (path) => {
        console.log(`Reading from ${path}`);
        const json = convertYamlToJson(path);
        if (json.contentType === "MAP") {
            maps.push(json);
        }
        if (json.contentType === "MAP_PACK") {
            mapPacks.push(json);
        }
        if (json.contentType === "MUTATOR") {
            mutators.push(json);
        }
        if (json.contentType === "MODEL") {
            models.push(json);
        }
        if (json.contentType === "SKIN") {
            skins.push(json);
        }
        if (json.contentType === "VOICE") {
            voices.push(json);
        }
    });
    // write to sqlite db
    const options = {
        ignoreDuplicates: true,
    };
    try {
        await Map.bulkCreate(maps, options);
        await MapPack.bulkCreate(mapPacks, options);
        await Mutator.bulkCreate(mutators, options);
        await Model.bulkCreate(models, options);
        await Skin.bulkCreate(skins, options);
        await Voice.bulkCreate(voices, options);
    }
    catch (e) {
        console.log("failed... probably due to hash collision");
        console.log(e);
    }
}
