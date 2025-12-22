"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const mdCache_1 = require("./mdCache");
const mdSymbolProvider_1 = require("./mdSymbolProvider");
const mdHoverProvider_1 = require("./mdHoverProvider");
const mdReferenceProvider_1 = require("./mdReferenceProvider");
const linkProvider_1 = require("./linkProvider");
const cache = new mdCache_1.GccMdCache();
// Track initialized directories to avoid re-scanning the same backend twice in one session
const initializedBackends = new Set();
async function activate(context) {
    const selector = { scheme: 'file', language: 'gcc-md' };
    // 1. Intelligent Initialization
    const ensureBackendIndexed = async (doc) => {
        if (doc.languageId !== 'gcc-md')
            return;
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
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor)
            ensureBackendIndexed(editor.document);
    }));
    // 2. File Watcher with Debounce
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.md');
    context.subscriptions.push(watcher);
    // Simple index update on change (Fast, single file update)
    watcher.onDidChange((uri) => cache.indexFile(uri));
    watcher.onDidCreate((uri) => cache.indexFile(uri));
    // Note: On delete, we might want to full reindex, but for now ignoring is safer
    // 3. Command Registration
    context.subscriptions.push(vscode.commands.registerCommand('gcc-md.openFilePermanent', (uri) => {
        vscode.window.showTextDocument(uri, { preview: false });
    }));
    // 4. Provider Registration (Pass cache instance)
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(selector, new mdSymbolProvider_1.GccMdSymbolProvider(cache)));
    context.subscriptions.push(vscode.languages.registerHoverProvider(selector, new mdHoverProvider_1.GccMdHoverProvider(cache)));
    context.subscriptions.push(vscode.languages.registerReferenceProvider(selector, new mdReferenceProvider_1.GccMdReferenceProvider(cache)));
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(selector, new linkProvider_1.GCCMdLinkProvider()));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map