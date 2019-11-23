import { projectStub } from './helper';
import { getTestsuites } from '../src/phpunit';

describe('PHPUnit Test Suite', () => {
    it('get testsuites', async () => {
        const testsuites = await getTestsuites(projectStub('phpunit.xml'));

        expect(testsuites).toEqual([
            {
                _name: 'default',
                directory: {
                    __text: 'tests',
                    _suffix: 'Test.php',
                },
            },
        ]);
    });
});
