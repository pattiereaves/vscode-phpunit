import { Process } from '../src/process';
import { projectStub } from './helper';
import { isNumber } from 'util';

describe('Process Test', () => {
    it('execute phpunit', async () => {
        let output = '';

        const process = new Process();
        process.on('data', (data: Buffer) => (output += data.toString()));

        const command = [
            projectStub('vendor/bin/phpunit'),
            '-c',
            projectStub('phpunit.xml'),
        ].join(' ');

        const code = await process.exec(command, {
            cwd: projectStub(),
        });

        expect(isNumber(code)).toBeTruthy();
        expect(process.getOutput()).toEqual(output);
        expect(output).toMatch(
            /PHPUnit \d+\.\d+\.\d+ by Sebastian Bergmann and contributors/,
        );
    });

    it('should kill the process', () => {
        const process = new Process();
        process.exec('sleep 5');

        expect(process.kill()).toBeTruthy();
        expect(process.kill()).toBeUndefined();
    });
});
