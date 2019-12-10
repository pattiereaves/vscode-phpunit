import { parse } from 'fast-xml-parser';
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

export async function getTestsuites(file: string) {
    const jsonData: any = await xml2json(
        (await readFileAsync(file)).toString(),
    );

    return jsonata('[**.testsuite]').evaluate(jsonData);
}
