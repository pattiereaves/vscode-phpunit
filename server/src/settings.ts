import { IConnection, WorkspaceFolder } from 'vscode-languageserver';
import { isArray, isObject, isString } from 'util';

export class SettingFactory {
    constructor(private connection: IConnection) {}

    async create(workspaceFolder: WorkspaceFolder) {
        return new Setting(
            this.replace(
                await this.connection.workspace.getConfiguration({
                    scopeUri: workspaceFolder.uri,
                    section: 'phpunit',
                }),
                workspaceFolder,
            ),
        );
    }

    replace(config: any, workspaceFolder: WorkspaceFolder) {
        if (isString(config)) {
            return this.replaceVariable(config, workspaceFolder);
        }

        if (isArray(config)) {
            return config.map(value => this.replace(value, workspaceFolder));
        }

        if (isObject(config)) {
            return Object.keys(config).reduce((acc, key) => {
                return Object.assign(acc, {
                    [key]: this.replace(config[key], workspaceFolder),
                });
            }, {});
        }

        return config;
    }

    private replaceVariable(value: any, workspaceFolder: WorkspaceFolder) {
        return value.replace(/\$\{workspaceFolder\}/g, workspaceFolder.uri);
    }
}

export class Setting {
    constructor(private items: any) {}

    all() {
        return this.items;
    }
}
