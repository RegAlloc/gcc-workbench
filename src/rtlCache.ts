import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class RtlDefCache {
    private definitions = new Map<string, string>();

    public async initialize(context: vscode.ExtensionContext) {
        const rtlDefPath = context.asAbsolutePath(path.join('src', 'rtl.def'));
        if (!fs.existsSync(rtlDefPath)) return;

        const content = await fs.promises.readFile(rtlDefPath, 'utf8');
        this.parseRtlDef(content);
    }

    public getExplanation(name: string): string | undefined {
        return this.definitions.get(name);
    }

    private parseRtlDef(content: string) {
        const lines = content.split('\n');
        
        // Helper to check if a line looks like a definition
        const isDef = (line: string) => line.trim().startsWith('DEF_RTL_EXPR');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // We only care when we hit a Definition
            if (isDef(line)) {
                const match = /DEF_RTL_EXPR\s*\(\s*[A-Z0-9_]+,\s*"([^"]+)"/.exec(line);
                if (!match) continue;
                
                const name = match[1]; // e.g. "set"
                
                // --- LOOK BEHIND LOGIC ---
                // Scan backwards from this line to find docs
                let doc: string | undefined = undefined;
                
                for (let j = i - 1; j >= 0; j--) {
                    const prevLine = lines[j].trim();
                    
                    if (prevLine === '') {
                        // Stop at blank lines. This ensures we don't accidentally 
                        // grab the separator comment (lines 285-287) if there is a gap.
                        break;
                    }

                    // 1. If previous line is ANOTHER definition (Grouping)
                    // e.g. ASHIFTRT following ASHIFT
                    if (isDef(prevLine)) {
                        const prevMatch = /DEF_RTL_EXPR\s*\(\s*[A-Z0-9_]+,\s*"([^"]+)"/.exec(prevLine);
                        if (prevMatch) {
                            // Inherit the documentation from the previous instruction
                            doc = this.definitions.get(prevMatch[1]);
                        }
                        break; // Found our source, stop scanning
                    }

                    // 2. If previous line is the END of a comment block "*/"
                    if (prevLine.endsWith('*/')) {
                        // We found a comment block. Now extract the whole block.
                        const commentLines: string[] = [];
                        
                        // Walk backwards collecting comment lines until "/*"
                        for (let k = j; k >= 0; k--) {
                            const commentLine = lines[k].trim();
                            commentLines.unshift(commentLine); // Add to start
                            if (commentLine.startsWith('/*')) {
                                break; // Start of comment found
                            }
                        }
                        
                        doc = this.formatComment(commentLines);
                        break; // Found our doc, stop scanning
                    }
                }

                if (doc) {
                    this.definitions.set(name, doc);
                }
            }
        }
    }

    private formatComment(rawLines: string[]): string {
        return rawLines
            .map(line => {
                let clean = line.trim();
                clean = clean.replace(/^\/\*+/, '').replace(/\*+\/$/, ''); // Remove /* and */
                clean = clean.replace(/^\*+\s?/, '').trim(); // Remove leading *
                return clean;
            })
            .filter((line, index, arr) => {
                // Remove empty lines only from edges
                if (line === '' && (index === 0 || index === arr.length - 1)) return false;
                return true;
            })
            .join('  \n'); // Markdown Hard Break
    }
}