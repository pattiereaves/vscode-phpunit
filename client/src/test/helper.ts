import { extensions, workspace } from 'vscode';
import { TestAdapterRegistrar } from 'vscode-test-adapter-util';
import { ExampleAdapter } from '../adapter';

export async function getAdapter() {
    const extension = extensions.getExtension('recca0120.vscode-phpunit')!;
    const adapterRegistrar: TestAdapterRegistrar<ExampleAdapter> = await extension.activate();

    return adapterRegistrar.getAdapter(workspace.workspaceFolders![0])!;
}

export async function sleep(seconds: number) {
    return new Promise(resolve =>
        setTimeout(() => resolve(true), seconds * 1000),
    );
}
