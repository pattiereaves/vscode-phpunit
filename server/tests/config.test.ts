import URI, { setUriThrowOnMissingScheme } from 'vscode-uri';
import { ConfigFactory, Config } from '../src/config';
import { projectStub } from './helper';

setUriThrowOnMissingScheme(false);

class FakeWorkspace {
    getConfiguration() {
        return Promise.resolve({
            php: 'php',
            phpunit: '${workspaceFolder}/vendor/bin/phpunit',
            args: ['--configuration', '${workspaceFolder}/phpunit.xml.dist'],
            paths: {
                // prettier-ignore
                '/local/path/to/map/to/virtual/path': '${workspaceFolder}/virtual/path',
                '/second/local/path': '/second/virtual/path',
            },
        });
    }
}

class FakeConnection {
    workspace = new FakeWorkspace();
}

describe('Config Test Suite', () => {
    const uri = URI.parse(projectStub());
    const workspaceFolder = { uri: uri.toString(), name: 'config' };
    const connection: any = new FakeConnection();
    const factory = new ConfigFactory(connection);

    let config: Config;

    beforeEach(async () => {
        config = await factory.create(workspaceFolder);
    });

    it('get config', async () => {
        const expected = JSON.parse(
            JSON.stringify(
                await connection.workspace.getConfiguration(),
            ).replace(/\$\{workspaceFolder\}/g, workspaceFolder.uri),
        );

        expect(config.all()).toEqual(expected);
    });
});
