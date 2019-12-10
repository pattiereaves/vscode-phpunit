import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    DidChangeConfigurationNotification,
    WorkspaceFolder,
    RequestType,
} from 'vscode-languageserver';
import { SettingFactory } from './settings';

let connection = createConnection(ProposedFeatures.all);

let documents: TextDocuments = new TextDocuments();

connection.onInitialize(() => ({
    capabilities: {
        textDocumentSync: documents.syncKind,
    },
}));

connection.onInitialized(() => {
    connection.client.register(
        DidChangeConfigurationNotification.type,
        undefined,
    );

    connection.workspace.onDidChangeWorkspaceFolders(_event => {
        connection.console.log('Workspace folder change event received.');
    });
});

connection.onDidChangeWatchedFiles(_change => {
    connection.console.log('We received an file change event');
});

namespace TestLoadTest {
    // prettier-ignore
    export const type: RequestType<WorkspaceFolder, any, any, any> = new RequestType('load');
}

function log(x: any) {
    connection.console.log(JSON.stringify(x));
}

connection.onRequest(TestLoadTest.type, async (workspace: WorkspaceFolder) => {
    const settingFactory = new SettingFactory(connection);
    const setting = await settingFactory.create(workspace);

    log(setting);

    return {
        type: 'suite',
        id: 'root',
        label: 'Fake', // the label of the root node should be the name of the testing framework
        children: [
            {
                type: 'suite',
                id: 'nested',
                label: 'Nested suite',
                children: [
                    {
                        type: 'test',
                        id: 'test1',
                        label: 'Test #1',
                    },
                    {
                        type: 'test',
                        id: 'test2',
                        label: 'Test #2',
                    },
                ],
            },
            {
                type: 'test',
                id: 'test3',
                label: 'Test #3',
            },
            {
                type: 'test',
                id: 'test4',
                label: 'Test #4',
            },
        ],
    };
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
