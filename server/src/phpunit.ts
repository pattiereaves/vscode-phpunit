import { parse } from 'fast-xml-parser';
import { PathLike } from 'fs';
import * as jsonata from 'jsonata';
import { readFileAsync } from './helper';

export function xml2json(contents: string) {
    return parse(contents, {
        attributeNamePrefix: '_',
        ignoreAttributes: false,
        ignoreNameSpace: false,
        parseNodeValue: true,
        parseAttributeValue: true,
        trimValues: true,
        textNodeName: '__text',
    });
}

export async function xmlFile2json(file: PathLike) {
    return await xml2json((await readFileAsync(file)).toString());
}

export async function getTestsuites(file: PathLike) {
    return jsonata('[**.testsuite]').evaluate(await xmlFile2json(file));
}

// export class Configuration {
//     constructor(private setting: Configuration) {}
// }
