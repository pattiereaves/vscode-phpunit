import { join } from 'path';
import { WorkspaceFolder } from 'vscode-languageserver';
import URI, { setUriThrowOnMissingScheme } from 'vscode-uri';
import { Setting, SettingFactory } from '../src/settings';
import { projectStub } from './helper';

class ConnectionStub {
    workspace = {
        getConfiguration: () => {
            return Promise.resolve(this.settings);
        },
    };
    constructor(private settings: any) {}
}

describe('Settings Test Suite', () => {
    const defaultSetting = {
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

    function getFactory(setting = null) {
        const connection: any = new ConnectionStub(setting ?? defaultSetting);

        return [connection, new SettingFactory(connection)];
    }

    beforeAll(() => {
        setUriThrowOnMissingScheme(false);
        workspaceFolder = {
            uri: URI.parse(projectStub()).toString(),
            name: 'config',
        };
    });
    afterAll(() => setUriThrowOnMissingScheme(true));

    let setting: Setting;

    it('get setting', async () => {
        const [connection, factory] = getFactory();
        setting = await factory.create(workspaceFolder);

        const expected = JSON.parse(
            JSON.stringify(
                await connection.workspace.getConfiguration(),
            ).replace(/\$\{workspaceFolder\}/g, workspaceFolder.uri),
        );

        expect(setting.all()).toEqual(expected);
    });

    it('get configuration from -c', async () => {
        const [, factory] = getFactory(
            Object.assign(defaultSetting, {
                args: ['-c', './phpunit.xml'],
            }),
        );
        setting = await factory.create(workspaceFolder);

        expect(await setting.getConfiguration()).toEqual(
            join(workspaceFolder.uri, './phpunit.xml'),
        );
    });

    it('get configuration from --configuration', async () => {
        const [, factory] = getFactory(
            Object.assign(defaultSetting, {
                args: ['--configuration', 'phpunit.xml.dist'],
            }),
        );
        setting = await factory.create(workspaceFolder);

        expect(await setting.getConfiguration()).toEqual(
            join(workspaceFolder.uri, 'phpunit.xml.dist'),
        );
    });

    it('get default configuration', async () => {
        const [, factory] = getFactory(
            Object.assign(defaultSetting, {
                args: [],
            }),
        );
        setting = await factory.create(workspaceFolder);

        expect(await setting.getConfiguration()).toEqual(
            join(workspaceFolder.uri, 'phpunit.xml'),
        );
    });
});
