import * as vscode from 'vscode';
import * as path from 'path';
import { GccMdCache } from './mdCache';
import { GccMdSymbolProvider } from './mdSymbolProvider';
import { GccMdHoverProvider } from './mdHoverProvider';
import { GccMdReferenceProvider } from './mdReferenceProvider';
import { GCCMdLinkProvider } from './linkProvider';

const cache = new GccMdCache();

// Track initialized directories to avoid re-scanning the same backend twice in one session
const initializedBackends = new Set<string>();

export async function activate(context: vscode.ExtensionContext) {
    const selector: vscode.DocumentSelector = { scheme: 'file', language: 'gcc-md' };

    // 1. Intelligent Initialization
    const ensureBackendIndexed = async (doc: vscode.TextDocument) => {
        if (doc.languageId !== 'gcc-md') return;
        const dir = path.dirname(doc.uri.fsPath);

        if (!initializedBackends.has(dir)) {
            initializedBackends.add(dir);
            vscode.window.setStatusBarMessage(`Indexing GCC Backend: ${path.basename(dir)}...`, 2000);
            await cache.forceReindex(doc.uri);
        }
    };

    // Trigger on load
    if (vscode.window.activeTextEditor) {
        await ensureBackendIndexed(vscode.window.activeTextEditor.document);
    }

    // Trigger on tab switch (Lazy Loading)
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) ensureBackendIndexed(editor.document);
        })
    );

    // 2. File Watcher with Debounce
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.md');
    context.subscriptions.push(watcher);
    
    // Simple index update on change (Fast, single file update)
    watcher.onDidChange((uri) => cache.indexFile(uri));
    watcher.onDidCreate((uri) => cache.indexFile(uri));
    // Note: On delete, we might want to full reindex, but for now ignoring is safer

    // 3. Command Registration
    context.subscriptions.push(vscode.commands.registerCommand('gcc-md.openFilePermanent', (uri: vscode.Uri) => {
        vscode.window.showTextDocument(uri, { preview: false });
    }));

    // 4. Provider Registration (Pass cache instance)
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(selector, new GccMdSymbolProvider(cache)));
    context.subscriptions.push(vscode.languages.registerHoverProvider(selector, new GccMdHoverProvider(cache)));
    context.subscriptions.push(vscode.languages.registerReferenceProvider(selector, new GccMdReferenceProvider(cache)));
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(selector, new GCCMdLinkProvider()));
}

export function deactivate() {}