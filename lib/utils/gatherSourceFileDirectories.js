import { execSync } from "child_process";
import { fdir } from "fdir";
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { l } from "./logger.js";
const UNREAL_METADATA_REPO = "https://github.com/unreal-archive/unreal-archive-data.git";
// const UNREAL_METADATA_PATH = "unreal-archive-data/content"
const UNREAL_METADATA_PATH = "temp/unreal-archive-data/content/Unreal/Maps/Unknown/0";
const YAML_SOURCE_FILES_PATH = "temp/yaml-source-files.json";
export async function gatherSourceFileDirectories() {
    return new Promise((resolve, reject) => {
        try {
            // pull a fresh repo and dump it locally if it doesnt exist
            if (!existsSync(UNREAL_METADATA_PATH)) {
                l('Pulling latest data from Unreal Archive Data repo (This can take a while)');
                execSync(`git clone ${UNREAL_METADATA_REPO} ./temp/unreal-archive-data`);
                l('Done pulling repo');
            }
            const fileFinder = new fdir().withFullPaths().crawl(UNREAL_METADATA_PATH);
            const files = fileFinder.sync();
            const numFiles = Object.values(files).length;
            l(`Found ${numFiles} files`);
            writeFileSync(YAML_SOURCE_FILES_PATH, JSON.stringify(files), {});
            resolve(JSON.parse(String(readFileSync(YAML_SOURCE_FILES_PATH))));
        }
        catch (e) {
            l(`ERROR: ${e}`);
            reject(e);
        }
    });
}
