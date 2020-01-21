import { Event, EventEmitter, WorkspaceFolder } from 'vscode';
import {
    LanguageClient,
    RequestType,
    WorkspaceFolder as LspWorkspaceFolder,
} from 'vscode-languageclient';
import {
    TestAdapter,
    TestEvent,
    TestLoadFinishedEvent,
    TestLoadStartedEvent,
    TestRunFinishedEvent,
    TestRunStartedEvent,
    TestSuiteEvent,
} from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';
import { runFakeTests } from './fakeTests';

namespace TestLoadTest {
    // prettier-ignore
    export const type: RequestType<LspWorkspaceFolder, any, any, any> = new RequestType('load');
}

/**
 * This class is intended as a starting point for implementing a "real" TestAdapter.
 * The file `README.md` contains further instructions.
 */
export class ExampleAdapter implements TestAdapter {
    private disposables: { dispose(): void }[] = [];

    private readonly testsEmitter = new EventEmitter<
        TestLoadStartedEvent | TestLoadFinishedEvent
    >();
    private readonly testStatesEmitter = new EventEmitter<
        TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent
    >();
    private readonly autorunEmitter = new EventEmitter<void>();

    get tests(): Event<TestLoadStartedEvent | TestLoadFinishedEvent> {
        return this.testsEmitter.event;
    }
    get testStates(): Event<
        TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent
    > {
        return this.testStatesEmitter.event;
    }
    get autorun(): Event<void> | undefined {
        return this.autorunEmitter.event;
    }

    constructor(
        public readonly workspace: WorkspaceFolder,
        private client: LanguageClient,
        private readonly log: Log,
    ) {
        this.log.info('Initializing example adapter');

        this.disposables.push(this.testsEmitter);
        this.disposables.push(this.testStatesEmitter);
        this.disposables.push(this.autorunEmitter);
    }

    async load(): Promise<void> {
        this.log.info('Loading example tests');

        this.testsEmitter.fire(<TestLoadStartedEvent>{ type: 'started' });

        this.testsEmitter.fire(<TestLoadFinishedEvent>{
            type: 'finished',
            suite: await this.client.sendRequest(TestLoadTest.type, {
                uri: this.workspace.uri.toString(),
                name: this.workspace.name,
            }),
        });
    }

    async run(tests: string[]): Promise<void> {
        this.log.info(`Running example tests ${JSON.stringify(tests)}`);

        this.testStatesEmitter.fire(<TestRunStartedEvent>{
            type: 'started',
            tests,
        });

        // in a "real" TestAdapter this would start a test run in a child process
        await runFakeTests(tests, this.testStatesEmitter);

        this.testStatesEmitter.fire(<TestRunFinishedEvent>{ type: 'finished' });
    }

    /*	implement this method if your TestAdapter supports debugging tests
	async debug(tests: string[]): Promise<void> {
		// start a test run in a child process and attach the debugger to it...
	}
*/

    cancel(): void {
        // in a "real" TestAdapter this would kill the child process for the current test run (if there is any)
        throw new Error('Method not implemented.');
    }

    dispose(): void {
        this.cancel();
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables = [];
    }
}
