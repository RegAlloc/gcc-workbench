import * as vscode from 'vscode';
import { GccMdCache, GccSymbol } from './mdCache';

export class GccMdHoverProvider implements vscode.HoverProvider {
    constructor(private cache: GccMdCache) {}

    private readonly forbiddenWords = new Set(['match_dup', 'match_operand', 'match_scratch', 'set', 'const_int', 'clobber']);
    private readonly constraintModifiers = /^[\=\+\&\%\?\!\*\#\^]+/;

    public provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
        const lineText = document.lineAt(position.line).text;
        
        // Use the same robust parser
        const wordInfo = this.getWordUnderCursor(lineText, position.character);
        if (!wordInfo) return null;

        const { word, isQuoted, isBracketed } = wordInfo;
        const cleanWord = word.replace(this.constraintModifiers, '');

        if (this.forbiddenWords.has(cleanWord)) return null;

        // Get Candidates
        const candidates = this.cache.getAllSymbols(document.uri, cleanWord);
        if (candidates.length === 0) return null;

        let bestMatch: GccSymbol | undefined;

        if (isQuoted) {
            // Priority: Constraint > Predicate > Attribute
            bestMatch = candidates.find(s => s.type === 'constraint');
            if (!bestMatch) bestMatch = candidates.find(s => s.type === 'predicate');
            if (!bestMatch) bestMatch = candidates.find(s => s.type === 'attribute');
        } 
        else {
            if (isBracketed) {
                bestMatch = candidates.find(s => s.type === 'iterator');
                if (!bestMatch) bestMatch = candidates.find(s => s.type === 'attribute');
            } else {
                bestMatch = candidates.find(s => s.type === 'iterator');
                if (!bestMatch) bestMatch = candidates.find(s => s.type === 'constant');
                if (!bestMatch) bestMatch = candidates.find(s => s.type === 'unspec');
            }
        }

        if (bestMatch) {
            const markdown = new vscode.MarkdownString();
            markdown.appendMarkdown(`### 💡 GCC (${bestMatch.type}): **${cleanWord}**\n`);
            if (bestMatch.comments) markdown.appendMarkdown(`${bestMatch.comments}\n\n---\n`);
            markdown.appendCodeblock(bestMatch.definition, 'gcc-md');
            return new vscode.Hover(markdown);
        }
        return null;
    }

    // --- COPY OF THE ROBUST PARSER ---
    // (Ideally, move this to a shared 'utils.ts' file to avoid code duplication)
    private getWordUnderCursor(line: string, charIndex: number): { word: string, isQuoted: boolean, isBracketed: boolean } | null {
        let inString = false;
        let startQuote = -1;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                if (inString) {
                    if (charIndex > startQuote && charIndex <= i) {
                        return this.parseConstraintList(line.substring(startQuote + 1, i), charIndex - (startQuote + 1));
                    }
                    inString = false;
                } else {
                    inString = true;
                    startQuote = i;
                }
            }
        }

        let start = charIndex;
        while (start > 0 && /[a-zA-Z0-9_<>]/.test(line[start - 1])) start--;
        let end = charIndex;
        while (end < line.length && /[a-zA-Z0-9_<>]/.test(line[end])) end++;
        
        const rawToken = line.substring(start, end);
        if (rawToken.includes('<') || rawToken.includes('>')) {
            return { word: rawToken.replace(/[<>]/g, ''), isQuoted: false, isBracketed: true };
        }
        
        start = charIndex;
        while (start > 0 && /[a-zA-Z0-9_]/.test(line[start - 1])) start--;
        end = charIndex;
        while (end < line.length && /[a-zA-Z0-9_]/.test(line[end])) end++;
        
        const bareWord = line.substring(start, end);
        if (bareWord.length > 0) return { word: bareWord, isQuoted: false, isBracketed: false };
        return null;
    }

    private parseConstraintList(content: string, relativeCursor: number): { word: string, isQuoted: boolean, isBracketed: boolean } {
        let currentPos = 0;
        const parts = content.split(',');
        for (const part of parts) {
            if (relativeCursor >= currentPos && relativeCursor <= currentPos + part.length) {
                return { word: part.trim(), isQuoted: true, isBracketed: false };
            }
            currentPos += part.length + 1;
        }
        return { word: content.trim(), isQuoted: true, isBracketed: false };
    }
}