import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class GccMdSymbolProvider implements vscode.DefinitionProvider {
    private readonly keywords = new Set(['const_int', 'const_string', 'match_operand', 'match_scratch', 'set', 'list', 'unspec', 'unspec_volatile']);

    public async provideDefinition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Definition | null> {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) return null;
        
        const word = document.getText(wordRange).replace(/"/g, '');
        if (this.keywords.has(word)) return null;

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
            if (location) return location;
        }

        return null;
    }

    private findInText(filePath: string, content: string, word: string): vscode.Location | null {
        const pattern = new RegExp(
            `\\(define_(attr|predicate|special_predicate|constraint|register_constraint|memory_constraint|address_constraint)\\s+"${word}"` +
            `|\\(define_[a-z]+_(iterator|attr)\\s+${word}\\b` +
            `|\\(\\s*${word}\\s+([0-x0-9a-fA-F-]+)\\s*\\)`, 
            'm'
        );
        
        const match = content.match(pattern);
        if (match && match.index !== undefined) {
            const lines = content.substring(0, match.index).split('\n');
            const line = lines.length - 1;
            const character = lines[line].length;

            return new vscode.Location(
                vscode.Uri.file(filePath),
                new vscode.Range(line, character, line, character + word.length)
            );
        }
        return null;
    }
}