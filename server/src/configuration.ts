import * as minimist from 'minimist';
import { join } from 'path';
import { URL } from 'url';
import { isArray, isObject, isString } from 'util';
import { IConnection, WorkspaceFolder } from 'vscode-languageserver';
import { accessAsync } from './helper';

export class ConfigurationFactory {
    constructor(private connection: IConnection) {}

    async create(workspaceFolder: WorkspaceFolder) {
        return new Configuration(
            workspaceFolder,
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
            return this.replaceVariables(config, workspaceFolder);
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

    private replaceVariables(value: string, workspaceFolder: WorkspaceFolder) {
        return value.replace(/\$\{workspaceFolder\}/g, workspaceFolder.uri);
    }
}

export class Configuration {
    constructor(private workspaceFolder: WorkspaceFolder, private items: any) {}

    async getConfigurationFile() {
        const argv = minimist(this.items.args);
        const files = [
            argv.c ?? argv.configuration,
            'phpunit.xml',
            'phpunit.xml.dist',
        ];

        for (let file of files) {
            if (!file) {
                continue;
            }

            if (!file.match(/^\/|\w:|file:/)) {
                file = join(this.workspaceFolder.uri, file);
            }

            if (await accessAsync(new URL(file))) {
                return file;
            }
        }
    }

    all() {
        return this.items;
    }
}
