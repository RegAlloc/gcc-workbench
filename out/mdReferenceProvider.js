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
exports.GccMdSymbolProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class GccMdSymbolProvider {
    keywords = new Set(['const_int', 'const_string', 'match_operand', 'match_scratch', 'set', 'list', 'unspec', 'unspec_volatile']);
    async provideDefinition(document, position) {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange)
            return null;
        const word = document.getText(wordRange).replace(/"/g, '');
        if (this.keywords.has(word))
            return null;
        const currentDir = path.dirname(document.uri.fsPath);
        // --- PRIORITY 1: Local Directory (.md files) ---
        const localFiles = fs.readdirSync(currentDir)
            .filter(f => f.endsWith('.md'))
            .map(f => path.join(currentDir, f));
        // Move current file to front of the search queue
        const searchQueue = [
            document.uri.fsPath,
            ...localFiles.filter(p => p !== document.uri.fsPath)
        ];
        // --- PRIORITY 2: common.md in the parent directory ---
        const commonMdPath = path.resolve(currentDir, '../common.md');
        if (fs.existsSync(commonMdPath)) {
            searchQueue.push(commonMdPath);
        }
        for (const filePath of searchQueue) {
            const content = fs.readFileSync(filePath, 'utf8');
            const location = this.findInText(filePath, content, word);
            if (location)
                return location;
        }
        return null;
    }
    findInText(filePath, content, word) {
        const pattern = new RegExp(`\\(define_(attr|predicate|special_predicate|constraint|register_constraint|memory_constraint|address_constraint)\\s+"${word}"` +
            `|\\(define_[a-z]+_(iterator|attr)\\s+${word}\\b` +
            `|\\(\\s*${word}\\s+([0-x0-9a-fA-F-]+)\\s*\\)`, 'm');
        const match = content.match(pattern);
        if (match && match.index !== undefined) {
            const lines = content.substring(0, match.index).split('\n');
            const line = lines.length - 1;
            const character = lines[line].length;
            return new vscode.Location(vscode.Uri.file(filePath), new vscode.Range(line, character, line, character + word.length));
        }
        return null;
    }
}
exports.GccMdSymbolProvider = GccMdSymbolProvider;
//# sourceMappingURL=mdReferenceProvider.js.map