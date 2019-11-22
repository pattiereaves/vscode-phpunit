import { Process } from '../src/process';
import { testFixture } from './helper';

describe('Process Test', () => {
    it('execute phpunit', async () => {
        let output = '';

        const process = new Process();
        process.on('data', (data: Buffer) => (output += data.toString()));

        const command = [
            testFixture('vendor/bin/phpunit'),
            testFixture('tests/SampleTest.php'),
            '-c',
            testFixture('phpunit.xml'),
        ].join(' ');

        const code = await process.exec(command, {
            cwd: testFixture(),
        });

        expect(code).toBe(0);
        expect(process.getOutput()).toEqual(output);
    });
});
