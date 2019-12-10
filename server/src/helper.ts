import { access, PathLike, readFile } from 'fs';
import { promisify } from 'util';

export const readFileAsync = promisify(readFile);

export function accessAsync(
    path: PathLike,
    mode: number | undefined = undefined,
) {
    return new Promise(resolve => {
        access(path, mode, err => resolve(!err));
    });
}
