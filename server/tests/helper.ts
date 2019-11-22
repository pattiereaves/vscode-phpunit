import { resolve } from 'path';

export function projectStub(path: string = '') {
    return resolve(__dirname, 'project-stub', path);
}

export function fixtures(path: string = '') {
    return resolve(__dirname, 'fixtures', path);
}
