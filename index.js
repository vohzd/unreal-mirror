/* eslint-disable no-new */
/* eslint-disable new-cap */

import { existsSync, readFileSync, writeFileSync } from 'fs';

import { outputFile } from 'fs-extra';

import slugify from '@sindresorhus/slugify';
import axios from 'axios';
import { fdir } from 'fdir';
import { parse as parseYAML } from 'yaml';

// const UNREAL_METADATA_PATH = '../unreal-archive-data/content/Unreal Tournament/Maps/BunnyTrack'

const OUTPUT_PATH = "../unrealarchive";
const UNREAL_METADATA_PATH = '../unreal-archive-data/content'
const YAML_SOURCE_FILES_PATH = './yaml-source-files.json'
// const FILE_METADATA_PATH = './file-metadata-small-sample.json'
const FILE_METADATA_PATH = './file-metadata-full.json'


const DOWNLOAD_QUEUE_PATH = './download-queue.json'
const FAILED_DOWNLOADS = './failed-downloads.json'


const CONCURRENCY_LIMIT = 6;

const queue = [];
const failedItems = []

function l (s) {
  return console.log(`STATUS: ${s}`)
}


function createFileMeta () {
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

function getFullFilePath(file){
  const firstPath = `${OUTPUT_PATH}/${slugify(file.game)}`;
  const secondPath = slugify(`${file.contentType}s`)
  let fullFilePath = `${firstPath}/${secondPath}/`

  if (file.gametype){
    fullFilePath += `${slugify(file.gametype)}`
  }

  return fullFilePath
}

function createDownloadQueue(){
  l('Downloading files to disk')
  const files = readFileJson(FILE_METADATA_PATH)

  files.forEach(async (file, i)=> {
    l(`Queuing item ${i + 1}/${files.length} (${file.name})`)
    queue.push(file)
  })

  if (!existsSync(DOWNLOAD_QUEUE_PATH)) {
    l('Creating download queue')
    writeFileSync(DOWNLOAD_QUEUE_PATH, JSON.stringify(queue), {})
  }
}

async function download(file, resolve, reject){

  try {
    const fullFilePath = getFullFilePath(file);

    if (!existsSync(`${fullFilePath}/${file.originalFilename}`)){
      l(`Downloading ${file.name}`)
      // console.log(file.downloads);
      const url = file?.downloads?.reduce((downloadPath) => {
        return downloadPath?.url?.includes("f002.backblazeb2.com") ? downloadPath.url : file.downloads[0].url
      })


      try {

        // annoyingly, fetch doesnt support HTTP2 so random requests fail!
        // const res = await fetch(typeof url === "string" ? url :  url.url)
        // const binary = await res.arrayBuffer()

        // using axios instead
        const { data } = await axios(typeof url === "string" ? url :  url.url, { responseType: "arraybuffer"});

        outputFile(`${fullFilePath}/${file.originalFilename}`, Buffer.from(new Uint8Array(data)))
        l(`Finished downloading ${file.name}`)

      }
      catch (e){
        l(`FAILED DOWNLOAD: ${url}`)
        failedItems.push(file);
      }

    }

    resolve()


  }
  catch (e){
    l(`ERROR: DOWNLOAD FAILED`)
    l(`ERROR: ${e}`)
    reject()
  }

}

async function gatherYamlSourceFiles () {
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

function readFileJson (path) {
  return JSON.parse(readFileSync(path))
}

function readFileYaml (path) {
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

async function resumeDownload(){
  const queue = readFileJson(DOWNLOAD_QUEUE_PATH)
  l(`Downloading ${queue.length} items`);

  if (queue.length){
    const segment = queue.splice(0, CONCURRENCY_LIMIT);
    const promises = [];
    segment.forEach((file, i) => {
      promises.push(new Promise((resolve, reject) => {
        download(file, resolve, reject);
      }))
    });

    console.log("promises...");
    console.log(promises);
    await Promise.all(promises);
    queue.splice(0, CONCURRENCY_LIMIT)

    // overwrite our previous queue with a new one
    writeFileSync(DOWNLOAD_QUEUE_PATH, JSON.stringify(queue))

    console.log("resuming...");

    // recursivity!
    resumeDownload()
  }
  else {
    l(`Did nothing`);
    l(`Writing failed files....`)

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
await gatherYamlSourceFiles()
await createFileMeta()

// create a queue of files
if (existsSync(DOWNLOAD_QUEUE_PATH)) {
  resumeDownload();
}
else {
  await createDownloadQueue()
  resumeDownload();
}



