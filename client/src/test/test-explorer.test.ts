import * as assert from 'assert';
import { fakeTestSuite } from '../fakeTests';
import { getAdapter } from './helper';

describe('Test Explorer Test', () => {
    it('test', async () => {
        const events: any = {};
        const adapter = await getAdapter();

        adapter.tests((e: any) => (events[e.type] = e));

        await adapter.load();

        assert.deepStrictEqual(events.started, { type: 'started' });
        assert.deepStrictEqual(events.finished, {
            type: 'finished',
            suite: fakeTestSuite,
        });
    });
});
