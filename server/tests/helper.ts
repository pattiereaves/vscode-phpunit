import { resolve } from 'path';

export function testFixture(path: string = '') {
    return resolve(__dirname, 'fixtures', path);
}
