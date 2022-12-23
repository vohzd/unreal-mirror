/* eslint-disable no-new */
/* eslint-disable new-cap */
import * as dotenv from 'dotenv';
dotenv.config();

import slugify from '@sindresorhus/slugify';
import axios from 'axios';
import { fdir } from 'fdir';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { outputFile } from 'fs-extra';
import { parse as parseYAML } from 'yaml';

import l from "./utils/logger";

const YAML_SOURCE_FILES_PATH = process.env.YAML_SOURCE_FILES_PATH;
const FILE_METADATA_PATH = process.env.FILE_METADATA_PATH;
const DOWNLOAD_QUEUE_PATH = process.env.DOWNLOAD_QUEUE_PATH
const OUTPUT_PATH = process.env.OUTPUT_PATH
const FAILED_DOWNLOADS = process.env.FAILED_DOWNLOADS
const CONCURRENCY_LIMIT = process.env.CONCURRENCY_LIMIT
const UNREAL_METADATA_PATH = process.env.UNREAL_METADATA_PATH

const queue = readFileJson(DOWNLOAD_QUEUE_PATH) || [];
const failedItems = []

function createFileMeta() {
  l('createFileMeta')
  const files = readFileJson(YAML_SOURCE_FILES_PATH)
  const tempData = []

  files.forEach((path, i) => {
    l(`Creating item ${i + 1}`)

    try {
      const contents = readFileYaml(path)
      tempData.push(contents)
    } catch (e) {
      l(`Loop failed at position ${i}`)
      console.log(e)
    }
  })

  // end loop, save it
  if (!existsSync(FILE_METADATA_PATH)) {
    l('Creating file')
    writeFileSync(FILE_METADATA_PATH, JSON.stringify(tempData))
  }
}

function getFullFilePath(file) {
  const firstPath = `${OUTPUT_PATH}/${slugify(file.game)}`;
  const secondPath = slugify(`${file.contentType}s`)
  let fullFilePath = `${firstPath}/${secondPath}/`

  if (file.gametype) {
    fullFilePath += `${slugify(file.gametype)}`
  }

  return fullFilePath
}

function createDownloadQueue() {
  l('Downloading files to disk')
  const files = readFileJson(FILE_METADATA_PATH)

  files.forEach(async (file, i) => {
    l(`Queuing item ${i + 1}/${files.length} (${file.name})`)
    queue.push(file)
  })

  if (!existsSync(DOWNLOAD_QUEUE_PATH)) {
    l('Creating download queue')
    writeFileSync(DOWNLOAD_QUEUE_PATH, JSON.stringify(queue), {})
  }
}

async function download(file, resolve, reject) {

  try {
    const fullFilePath = getFullFilePath(file);

    if (!existsSync(`${fullFilePath}/${file.originalFilename}`)) {
      const {url} = file?.downloads?.find((downloadPath) => {
        return downloadPath?.url?.includes("f002.backblazeb2.com") ||
          downloadPath?.url?.includes("unreal-archive-files.eu-central-1.linodeobjects.com") ||
          downloadPath?.url?.includes("files.vohzd.com/unrealarchive")
      })

      l(`Downloading ${file.name} from ${url}`)

      try {

        // annoyingly, fetch doesnt support HTTP2 so random requests fail!
        // const res = await fetch(typeof url === "string" ? url :  url.url)
        // const binary = await res.arrayBuffer()

        // using axios instead
        if (url){
          const { data } = await axios(url, { responseType: "arraybuffer" });

          outputFile(`${fullFilePath}/${file.originalFilename}`, Buffer.from(new Uint8Array(data)))
          l(`Finished downloading ${file.name}`)
        }
        else {
          l(`NO VALID URL`)

        }


      }
      catch (e) {
        l(`FAILED DOWNLOAD: ${url}`)
        console.log(e);
        failedItems.push(file);
      }

    }

    resolve()


  }
  catch (e) {
    l(`ERROR: DOWNLOAD FAILED`)
    l(`ERROR: ${e}`)
    reject()
  }

}

async function gatherSourceFileDirectories() {
  new Promise((resolve, reject) => {
    try {
      if (!existsSync(YAML_SOURCE_FILES_PATH)) {
        l('Creating file')
        writeFileSync(YAML_SOURCE_FILES_PATH, '')
      }

      l('Fresh search needed')

      const fileFinder = new fdir().withFullPaths().crawl(UNREAL_METADATA_PATH)

      const files = fileFinder.sync()
      l(`Found ${files.length} files.`)
      writeFileSync(YAML_SOURCE_FILES_PATH, JSON.stringify(files), {})
      l('Writing new file')

      resolve()
    } catch (e) {
      l(`ERROR: ${e}`)
      reject(e)
    }
  })
}

function readFileJson(path) {
  return JSON.parse(readFileSync(path))
}

function readFileYaml(path) {
  const str = String(readFileSync(path))

  const cleaned = str
    .replaceAll('--- !<MAP>', '')
    .replaceAll('--- !<MAP_PACK>', '')
    .replaceAll('--- !<MUTATOR>', '')
    .replaceAll('--- !<MODEL>', '')
    .replaceAll('--- !<SKIN>', '')
    .replaceAll('--- !<VOICE>', '')

  return parseYAML(cleaned)
}

async function resumeDownload() {
  l(`Downloading ${queue.length} items`);

  if (queue.length) {
    const segment = queue.splice(0, CONCURRENCY_LIMIT);
    const promises = [];
    segment.forEach((file, i) => {
      promises.push(new Promise((resolve, reject) => {
        download(file, resolve, reject);
      }))
    });

    await Promise.all(promises);
    queue.splice(0, CONCURRENCY_LIMIT)

    // overwrite our previous queue with a new one
    writeFileSync(DOWNLOAD_QUEUE_PATH, JSON.stringify(queue))

    // recursivity!
    resumeDownload()
  }
  else {
    l(`Finished`);
    writeFileSync(FAILED_DOWNLOADS, JSON.stringify(failedItems))

  }


}


console.log(`
*******************************
***** UNREAL FILE FINDER ******
*******************************

UNREAL_METADATA_PATH: ${UNREAL_METADATA_PATH}
`)

// // only uncomment this if you want a fresh crawl
// await gatherSourceFileDirectories()
// await createFileMeta()

// create a queue of files
if (!existsSync(DOWNLOAD_QUEUE_PATH)) {
  await createDownloadQueue()
}

resumeDownload();




