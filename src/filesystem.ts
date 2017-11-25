import { dirname, parse as pathParse, resolve as pathResolve } from 'path';
import { isWindows, tap } from './helpers';
import { readFile, readFileSync, statSync, unlinkSync } from 'fs';

import { tmpdir } from 'os';

function existsSync(filePath) {
    try {
        statSync(filePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        }
    }

    return true;
}

function ensureArray(search: string[] | string): string[] {
    return search instanceof Array ? search : [search];
}

interface FilesystemInterface {
    find(search: string[] | string, cwd?: string): string;
    exists(search: string[] | string, cwd?: string): boolean;
    findUp(search: string[] | string, cwd?: string, root?: string): string;
}

export abstract class AbstractFilesystem {
    unlink(file: string): void {
        try {
            if (existsSync(file) === true) {
                unlinkSync(file);
            }
        } catch (e) {
            setTimeout(() => {
                this.unlink(file);
            }, 500);
        }
    }

    get(path: string): string {
        return readFileSync(path).toString();
    }

    getAsync(path: string, encoding = 'utf8'): Promise<string> {
        return new Promise((resolve, reject) => {
            readFile(path, encoding, (error, data) => {
                return error ? reject(error) : resolve(data);
            });
        });
    }

    tmpfile(tmpname: string, dir: string = '') {
        return pathResolve(!dir ? tmpdir() : dir, tmpname);
    }

    isFile(path: string): boolean {
        return statSync(path).isFile();
    }

    dirname(path: string): string {
        return dirname(path);
    }
}

class POSIX extends AbstractFilesystem implements FilesystemInterface {
    protected systemPaths: string[] = process.env.PATH.split(/:|;/g).map(path => path.replace(/(:|;)$/, '').trim());
    protected extensions = [''];
    protected separator: string = '/';

    findUp(search: string[] | string, cwd: string = process.cwd(), basePath: string = ''): string {
        const root = pathParse(cwd).root;

        basePath = basePath === '' ? root : pathResolve(basePath);

        do {
            const find = this.findByPath(search, cwd);

            if (find) {
                return find;
            }

            cwd = pathResolve(cwd, '..');
        } while (cwd !== basePath && root !== cwd);

        return this.findBySystemPath(search);
    }

    find(search: string[] | string, cwd: string = process.cwd()): string {
        search = ensureArray(search);

        const find = this.findByPath(search, cwd);

        if (find) {
            return find;
        }

        return this.findBySystemPath(search);
    }

    exists(search: string[] | string, cwd: string = process.cwd()): boolean {
        search = ensureArray(search);

        for (const file of search) {
            if (
                this.extensions.some(extension => existsSync(`${cwd}${this.separator}${file}${extension}`)) ||
                this.extensions.some(extension => existsSync(`${file}${extension}`))
            ) {
                return true;
            }
        }

        return false;
    }

    protected findByPath(search: string[] | string, cwd: string = process.cwd()): string {
        search = ensureArray(search);

        for (const file of search) {
            for (const pwd of [`${cwd}${this.separator}`, '']) {
                for (const extension of this.extensions) {
                    const path = `${pwd}${file}${extension}`;

                    if (existsSync(path) === true) {
                        return pathResolve(path);
                    }
                }
            }
        }

        return '';
    }

    protected findBySystemPath(search: string[] | string): string {
        search = ensureArray(search);

        for (const systemPath of this.systemPaths) {
            const find = this.findByPath(search, systemPath);

            if (find) {
                return find;
            }
        }

        return '';
    }
}

class Windows extends POSIX {
    protected systemPaths: string[] = process.env.PATH.split(/;/g).map(path => path.replace(/(;)$/, '').trim());
    protected extensions = ['.bat', '.exe', '.cmd', ''];
    protected separator: string = '\\';
}

export class Filesystem extends AbstractFilesystem implements FilesystemInterface {
    constructor(private instance: FilesystemInterface = isWindows() ? new Windows() : new POSIX()) {
        super();
    }

    findUp(search: string[] | string, cwd: string = process.cwd(), basePath: string = ''): string {
        return this.instance.findUp(ensureArray(search), cwd, basePath);
    }

    find(search: string[] | string, cwd: string = process.cwd()): string {
        return this.instance.find(ensureArray(search), cwd);
    }

    exists(search: string[] | string, cwd: string = process.cwd()): boolean {
        return this.instance.exists(ensureArray(search), cwd);
    }
}

export class CachableFilesystem extends AbstractFilesystem implements FilesystemInterface {
    private cache: Map<string, string> = new Map<string, string>();

    constructor(private files = new Filesystem()) {
        super();
    }

    findUp(search: string[] | string, cwd: string = process.cwd(), basePath: string = ''): string {
        const key = this.key(search, [cwd, basePath]);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(this.files.findUp(search, cwd, basePath), find => this.cache.set(key, find));
    }

    find(search: string[] | string, cwd: string = process.cwd()): string {
        const key = this.key(search, [cwd]);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(this.files.find(search, cwd), find => this.cache.set(key, find));
    }

    exists(search: string[] | string, cwd: string = process.cwd()): boolean {
        const key = this.key(search, [cwd, 'exists']);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(this.files.exists(search, cwd), find => this.cache.set(key, find));
    }

    private key(search: string[] | string, opts: string[] = []) {
        return JSON.stringify(
            ensureArray(search)
                .concat(opts)
                .join('-')
        );
    }
}
