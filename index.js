/* eslint-disable no-new */
/* eslint-disable new-cap */
// import fs from "fs";

import { existsSync, readFileSync, writeFileSync } from 'fs'

import { fdir } from 'fdir'
import { parse as parseYAML } from 'yaml'

// const UNREAL_METADATA_PATH = '../unreal-archive-data/content/Unreal Tournament'
// // const UNREAL_METADATA_PATH = "../unreal-archive-data/content/Unreal Tournament/Maps/BunnyTrack/I/0/0/2e133b/ctf-bt-interscope-v2_[002e133b].yml";
const UNREAL_METADATA_PATH = '../unreal-archive-data/content/Unreal Tournament/Maps/BunnyTrack/I/0/0'
// // const UNREAL_METADATA_PATH = '../unreal-archive-data/content/Unreal Tournament/Maps/BunnyTrack/I/'

const YAML_SOURCE_FILES_PATH = './yaml-source-files.json'
const FILE_METADATA_PATH = './file-metadata-small-sample.json'

function l (s) {
  return console.log(`STATUS: ${s}`)
}

function createFileMeta () {
  l('Reading file')
  const files = readFileJson(YAML_SOURCE_FILES_PATH)
  const tempData = []

  files.forEach((path, i) => {
    l(`Reading file ${i + 1}`)

    try {
      const contents = readFileYaml(path)
      console.log(contents)

      tempData.push(contents)
    } catch (e) {
      l(`loop failed at position ${i}`)
      console.log(e)
    }
  })

  // end loop, save it
  if (!existsSync(FILE_METADATA_PATH)) {
    l('Creating file')
    writeFileSync(FILE_METADATA_PATH, JSON.stringify(tempData))
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
      writeFileSync(YAML_SOURCE_FILES_PATH, JSON.stringify(files))
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
    .replace('--- !<MAP>', '')
    .replace('--- !<MAP_PACK>', '')
    .replace('--- !<MUTATOR>', '')
    .replace('--- !<MODEL>', '')
    .replace('--- !<SKIN>', '')
    .replace('--- !<VOICE>', '')

  return parseYAML(cleaned)
}

console.log(`
*******************************
***** UNREAL FILE FINDER ******
*******************************

UNREAL_METADATA_PATH: ${UNREAL_METADATA_PATH}
`)

// only uncomment this if you want a fresh crawl
await gatherYamlSourceFiles()
createFileMeta()
