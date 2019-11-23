import { extensions, workspace, ExtensionContext } from 'vscode';
import { TestAdapterRegistrar } from 'vscode-test-adapter-util';
import { ExampleAdapter } from '../adapter';

export async function getAdapter() {
    const extension = extensions.getExtension('vscode-samples.lsp-sample')!;
    const context: ExtensionContext = await extension.activate();
    const adapterRegistrar = context.subscriptions.find(
        predicate => predicate instanceof TestAdapterRegistrar,
    ) as TestAdapterRegistrar<ExampleAdapter>;

    return adapterRegistrar.getAdapter(workspace.workspaceFolders[0]);
}

export async function sleep(seconds: number) {
    return new Promise(resolve =>
        setTimeout(() => resolve(true), seconds * 1000),
    );
}
