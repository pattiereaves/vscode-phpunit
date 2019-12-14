import { join } from 'path';
import { WorkspaceFolder } from 'vscode-languageserver';
import URI, { setUriThrowOnMissingScheme } from 'vscode-uri';
import { Configuration, ConfigurationFactory } from '../src/configuration';
import { projectStub } from './helper';

class ConnectionStub {
    workspace = {
        getConfiguration: () => {
            return Promise.resolve(this.configuration);
        },
    };
    constructor(private configuration: any) {}
}

describe('Configuration Test Suite', () => {
    const defaultConfiguration = {
        php: '',
        phpunit: '${workspaceFolder}/vendor/bin/phpunit',
        args: ['--configuration', '${workspaceFolder}/phpunit.xml.dist'],
        paths: {
            // prettier-ignore
            '/local/path/to/map/to/virtual/path': '${workspaceFolder}/virtual/path',
            '/second/local/path': '/second/virtual/path',
        },
    };

    let workspaceFolder: WorkspaceFolder;

    function getFactory(configuration = null) {
        const connection: any = new ConnectionStub(
            configuration ?? defaultConfiguration,
        );

        return [connection, new ConfigurationFactory(connection)];
    }

    beforeAll(() => {
        setUriThrowOnMissingScheme(false);
        workspaceFolder = {
            uri: URI.parse(projectStub()).toString(),
            name: 'config',
        };
    });
    afterAll(() => setUriThrowOnMissingScheme(true));

    let configuration: Configuration;

    it('get configuration', async () => {
        const [connection, factory] = getFactory();
        configuration = await factory.create(workspaceFolder);

        const expected = JSON.parse(
            JSON.stringify(
                await connection.workspace.getConfiguration(),
            ).replace(/\$\{workspaceFolder\}/g, workspaceFolder.uri),
        );

        expect(configuration.all()).toEqual(expected);
    });

    it('get configuration file from args -c', async () => {
        const [, factory] = getFactory(
            Object.assign(defaultConfiguration, {
                args: ['-c', './phpunit.xml'],
            }),
        );

        configuration = await factory.create(workspaceFolder);

        expect(await configuration.getConfigurationFile()).toEqual(
            join(workspaceFolder.uri, './phpunit.xml'),
        );
    });

    it('get configuration file from args --configuration', async () => {
        const [, factory] = getFactory(
            Object.assign(defaultConfiguration, {
                args: ['--configuration', 'phpunit.xml.dist'],
            }),
        );

        configuration = await factory.create(workspaceFolder);

        expect(await configuration.getConfigurationFile()).toEqual(
            join(workspaceFolder.uri, 'phpunit.xml.dist'),
        );
    });

    it('get default configuration file', async () => {
        const [, factory] = getFactory(
            Object.assign(defaultConfiguration, {
                args: [],
            }),
        );

        configuration = await factory.create(workspaceFolder);

        expect(await configuration.getConfigurationFile()).toEqual(
            join(workspaceFolder.uri, 'phpunit.xml'),
        );
    });
});
