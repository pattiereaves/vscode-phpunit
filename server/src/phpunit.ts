import { readFile } from 'fs';
import { promisify } from 'util';
import { parse } from 'fast-xml-parser';
import * as jsonata from 'jsonata';

const readFileAsync = promisify(readFile);

export async function getTestsuites(file: string) {
    const jsonData = parse((await readFileAsync(file)).toString(), {
        attributeNamePrefix: '_',
        ignoreAttributes: false,
        ignoreNameSpace: false,
        parseNodeValue: true,
        parseAttributeValue: true,
        trimValues: true,
        textNodeName: '__text',
    });

    return jsonata('[**.testsuite]').evaluate(jsonData);
}
