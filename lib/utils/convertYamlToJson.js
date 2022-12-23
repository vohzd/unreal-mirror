import { readFileSync } from 'fs';
import { parse as parseYAML } from 'yaml';
export function convertYamlToJson(path) {
    const str = String(readFileSync(path));
    const cleaned = str
        .replaceAll('--- !<MAP>', '')
        .replaceAll('--- !<MAP_PACK>', '')
        .replaceAll('--- !<MUTATOR>', '')
        .replaceAll('--- !<MODEL>', '')
        .replaceAll('--- !<SKIN>', '')
        .replaceAll('--- !<VOICE>', '');
    return parseYAML(cleaned);
}
