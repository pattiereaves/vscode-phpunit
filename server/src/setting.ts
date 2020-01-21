import * as minimist from 'minimist';
import { join } from 'path';
import { URL } from 'url';
import { isArray, isObject, isString } from 'util';
import { IConnection, WorkspaceFolder } from 'vscode-languageserver';
import { accessAsync } from './helper';

export class Settings {
    private items = new Map<WorkspaceFolder, any>();

    constructor(private connection: IConnection) {}

    async get(workspaceFolder: WorkspaceFolder) {
        let setting = this.items.get(workspaceFolder);

        if (!setting) {
            setting = await Setting.create(this.connection, workspaceFolder);

            this.items.set(workspaceFolder, setting);
        }

        return setting;
    }
}

export class Setting {
    private values: any = null;

    constructor(
        private connection: IConnection,
        private workspaceFolder: WorkspaceFolder,
    ) {}

    static async create(
        connection: IConnection,
        workspaceFolder: WorkspaceFolder,
    ) {
        return await new Setting(connection, workspaceFolder).update();
    }

    async findConfigurationFile() {
        const argv = minimist(this.values.args);

        let files = [
            argv.c,
            argv.configuration,
            'phpunit.xml',
            'phpunit.xml.dist',
        ];

        files = files
            .filter(file => !!file)
            .map(file =>
                file.match(/^\/|\w:|file:/)
                    ? file
                    : join(this.workspaceFolder.uri, file),
            );

        for (const file of files) {
            if (await accessAsync(new URL(file))) {
                return file;
            }
        }
    }

    async update() {
        this.values = this.replace(
            await this.connection.workspace.getConfiguration({
                scopeUri: this.workspaceFolder.uri,
                section: 'phpunit',
            }),
        );

        return this;
    }

    all() {
        return this.values;
    }

    private replace(values: any) {
        if (isString(values)) {
            return this.replaceVariables(values);
        }

        if (isArray(values)) {
            return values.map(value => this.replace(value));
        }

        if (isObject(values)) {
            return Object.keys(values).reduce((acc, key) => {
                return Object.assign(acc, {
                    [key]: this.replace(values[key]),
                });
            }, {});
        }

        return values;
    }

    private replaceVariables(value: string) {
        return value.replace(
            /\$\{workspaceFolder\}/g,
            this.workspaceFolder.uri,
        );
    }
}
