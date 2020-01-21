import { join } from 'path';
import { pathToFileURL } from 'url';
import { WorkspaceFolder } from 'vscode-languageserver';
import { Setting, Settings } from '../src/setting';
import { projectStub } from './helper';

class ConnectionStub {
    workspace = {
        getConfiguration: () => {
            return Promise.resolve(this.configuration);
        },
    };
    constructor(private configuration: any) {}
}

describe('Settings Test Suite', () => {
    const defaults = {
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
    let setting: Setting;

    function getSettings(values = null) {
        const connection: any = new ConnectionStub(values ?? defaults);

        return [new Settings(connection), connection];
    }

    beforeAll(() => {
        workspaceFolder = {
            uri: pathToFileURL(projectStub()).toString(),
            name: 'setting',
        };
    });

    it('get setting', async () => {
        const [settings, connection] = getSettings();
        setting = await settings.get(workspaceFolder);

        const expected = JSON.parse(
            JSON.stringify(
                await connection.workspace.getConfiguration(),
            ).replace(/\$\{workspaceFolder\}/g, workspaceFolder.uri),
        );

        expect(setting.all()).toEqual(expected);
    });

    it('find configuration file from args -c', async () => {
        const [settings] = getSettings(
            Object.assign(defaults, {
                args: ['-c', './phpunit.xml'],
            }),
        );

        setting = await settings.get(workspaceFolder);

        expect(await setting.findConfigurationFile()).toEqual(
            join(workspaceFolder.uri, './phpunit.xml'),
        );
    });

    it('find configuration file from args --configuration', async () => {
        const [settings] = getSettings(
            Object.assign(defaults, {
                args: ['--configuration', 'phpunit.xml.dist'],
            }),
        );

        setting = await settings.get(workspaceFolder);

        expect(await setting.findConfigurationFile()).toEqual(
            join(workspaceFolder.uri, 'phpunit.xml.dist'),
        );
    });

    it('get default configuration file', async () => {
        const [settings] = getSettings(
            Object.assign(defaults, {
                args: [],
            }),
        );

        setting = await settings.get(workspaceFolder);

        expect(await setting.findConfigurationFile()).toEqual(
            join(workspaceFolder.uri, 'phpunit.xml'),
        );
    });
});
