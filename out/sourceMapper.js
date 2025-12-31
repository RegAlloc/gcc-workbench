"use strict";
/*
 * Copyright (C) 2025 Kishan Parmar
 *
 * This file is part of GCC Workbench.
 *
 * GCC Workbench is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * GCC Workbench is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GCC Workbench.  If not, see <https://www.gnu.org/licenses/>.
 */
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
exports.SourceMapper = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// 🎨 LAYER 1: RAINBOW PALETTE
// UPDATED: Opacity increased to 0.05 (was 0.03) for better visibility.
const rainbowPalette = [
    'rgba(255, 0, 0, 0.05)', // Red
    'rgba(0, 255, 0, 0.05)', // Lime
    'rgba(0, 0, 255, 0.05)', // Blue
    'rgba(255, 255, 0, 0.05)', // Yellow
    'rgba(0, 255, 255, 0.05)', // Cyan
    'rgba(255, 0, 255, 0.05)', // Magenta
    'rgba(192, 192, 192, 0.05)', // Silver
    'rgba(128, 0, 0, 0.05)', // Maroon
    'rgba(128, 128, 0, 0.05)', // Olive
    'rgba(0, 128, 0, 0.05)', // Green
    'rgba(128, 0, 128, 0.05)', // Purple
    'rgba(0, 128, 128, 0.05)', // Teal
    'rgba(0, 0, 128, 0.05)', // Navy
    'rgba(255, 99, 71, 0.05)', // Tomato
    'rgba(255, 165, 0, 0.05)', // Orange
    'rgba(255, 215, 0, 0.05)', // Gold
    'rgba(189, 183, 107, 0.05)', // Dark Khaki
    'rgba(238, 130, 238, 0.05)', // Violet
    'rgba(106, 90, 205, 0.05)', // Slate Blue
    'rgba(173, 216, 230, 0.05)', // Light Blue
    'rgba(95, 158, 160, 0.05)', // Cadet Blue
    'rgba(60, 179, 113, 0.05)', // Medium Sea Green
    'rgba(154, 205, 50, 0.05)', // Yellow Green
    'rgba(210, 105, 30, 0.05)', // Chocolate
    'rgba(165, 42, 42, 0.05)', // Brown
    'rgba(220, 20, 60, 0.05)', // Crimson
    'rgba(255, 192, 203, 0.05)', // Pink
    'rgba(219, 112, 147, 0.05)', // Pale Violet Red
    'rgba(240, 230, 140, 0.05)', // Khaki
    'rgba(255, 228, 196, 0.05)', // Bisque
    'rgba(245, 222, 179, 0.05)', // Wheat
    'rgba(112, 128, 144, 0.05)' // Slate Gray
];
class SourceMapper {
    context;
    rtlEditor;
    sourceEditor;
    // 🎨 LAYER 2: ACTIVE HIGHLIGHT
    activeDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        isWholeLine: true,
        borderWidth: '0 0 0 3px',
        borderColor: 'rgba(0, 255, 255, 0.6)',
        borderStyle: 'solid'
    });
    rainbowDecorations = [];
    // Mapping Data
    sourceToRtlRanges = new Map();
    rtlBlocks = [];
    disposable;
    constructor(context) {
        this.context = context;
        this.rainbowDecorations = rainbowPalette.map(color => vscode.window.createTextEditorDecorationType({ backgroundColor: color, isWholeLine: true }));
    }
    async enable(activeEditor) {
        this.rtlEditor = activeEditor;
        const rtlDoc = this.rtlEditor.document;
        const text = rtlDoc.getText();
        // 1. Path Resolution
        const pathRegex = /"([^"]+\.(c|cc|cpp|h|hpp|f90|f95))":(\d+):(\d+)/;
        const match = pathRegex.exec(text);
        if (!match) {
            vscode.window.showErrorMessage("No source file references found in this dump.");
            return;
        }
        const rawPath = match[1];
        let sourceUri;
        let rootPath = '';
        if (vscode.workspace.workspaceFolders) {
            rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        if (rootPath) {
            const absolutePath = path.resolve(rootPath, rawPath);
            if (fs.existsSync(absolutePath))
                sourceUri = vscode.Uri.file(absolutePath);
        }
        if (!sourceUri) {
            const rtlDir = path.dirname(rtlDoc.uri.fsPath);
            const relativeToRtl = path.resolve(rtlDir, rawPath);
            if (fs.existsSync(relativeToRtl))
                sourceUri = vscode.Uri.file(relativeToRtl);
        }
        if (!sourceUri) {
            const filename = path.basename(rawPath);
            const files = await vscode.workspace.findFiles(`**/${filename}`, '**/node_modules/**', 1);
            if (files.length > 0)
                sourceUri = files[0];
        }
        if (!sourceUri) {
            vscode.window.showErrorMessage(`Could not locate source file: ${rawPath}`);
            return;
        }
        // 2. Build Precise Mapping (Fast Version)
        this.buildMapping(text);
        // 3. Layout Editors
        const sourceDoc = await vscode.workspace.openTextDocument(sourceUri);
        this.sourceEditor = await vscode.window.showTextDocument(sourceDoc, {
            viewColumn: vscode.ViewColumn.One,
            preserveFocus: false,
            preview: true
        });
        this.rtlEditor = await vscode.window.showTextDocument(rtlDoc, {
            viewColumn: vscode.ViewColumn.Two,
            preserveFocus: true,
            preview: true
        });
        // 4. Paint
        this.paintRainbow();
        this.startSync();
        vscode.window.showInformationMessage(`Linked RTL to source: ${path.basename(rawPath)}`);
    }
    // ⚡️ HARDCORE MODE: ZERO-ALLOCATION PARSER
    // Scans the 50MB string directly without splitting it into lines.
    // Drastically reduces Garbage Collection (GC) pauses.
    buildMapping(text) {
        this.sourceToRtlRanges.clear();
        this.rtlBlocks = [];
        const len = text.length;
        // State Machine Variables
        let balance = 0;
        let startLine = 0; // The line number where the current block started
        let currentLine = 0; // The line number we are currently scanning
        let lineStartIdx = 0; // The character index where the current line started
        let blockStartIndex = -1; // Character index where the block started '('
        let blockSourceLine = -1; // The result found: "filename":123
        let inString = false;
        // ASCII Constants (Hoisted for speed)
        const CHAR_OPEN = 40; // (
        const CHAR_CLOSE = 41; // )
        const CHAR_QUOTE = 34; // "
        const CHAR_COLON = 58; // :
        const CHAR_NL = 10; // \n
        const CHAR_0 = 48;
        const CHAR_9 = 57;
        for (let i = 0; i < len; i++) {
            const c = text.charCodeAt(i);
            // 1. Handle Newlines (Track Line Number)
            if (c === CHAR_NL) {
                currentLine++;
                lineStartIdx = i + 1;
                continue;
            }
            // 2. Handle Strings (Ignore contents)
            if (c === CHAR_QUOTE) {
                // Check for escaped quote? (Simplified for speed, usually fine for RTL)
                inString = !inString;
                continue;
            }
            if (inString)
                continue;
            // 3. Handle Parentheses (Structure)
            if (c === CHAR_OPEN) {
                // If this is the START of a top-level block
                if (balance === 0) {
                    startLine = currentLine; // Record which line this block started on
                    blockStartIndex = i;
                    blockSourceLine = -1; // Reset match
                }
                balance++;
            }
            else if (c === CHAR_CLOSE) {
                balance--;
                // If this is the END of a top-level block
                if (balance === 0 && blockStartIndex !== -1) {
                    // Commit Block if we found a source mapping
                    if (blockSourceLine !== -1) {
                        // Push to Binary Search Array
                        this.rtlBlocks.push({
                            start: startLine,
                            end: currentLine, // The block ends on the current line
                            sourceLine: blockSourceLine
                        });
                        // Push to Range Map (for Source -> RTL highlighting)
                        let ranges = this.sourceToRtlRanges.get(blockSourceLine);
                        if (!ranges) {
                            ranges = [];
                            this.sourceToRtlRanges.set(blockSourceLine, ranges);
                        }
                        // Create Range object (Allocation is unavoidable here, but minimized)
                        ranges.push(new vscode.Range(startLine, 0, currentLine, 1000));
                    }
                    // Reset
                    blockStartIndex = -1;
                }
            }
            // 4. Handle Source Marker Detection: ":123
            // Optimization: Only look for markers if we are inside a block or starting one
            if (balance > 0 && blockSourceLine === -1) {
                // We are looking for the sequence '":' (Quote followed by Colon)
                // We check 'c' is Colon, and previous char was Quote
                if (c === CHAR_COLON && i > 0 && text.charCodeAt(i - 1) === CHAR_QUOTE) {
                    // Found '":'. Now we must parse the integer immediately following.
                    // Scan forward from i+1 until non-digit
                    let p = i + 1;
                    let numStart = p;
                    let hasDigits = false;
                    // Peek forward manually (safe because string is in memory)
                    while (p < len) {
                        const digit = text.charCodeAt(p);
                        if (digit < CHAR_0 || digit > CHAR_9)
                            break;
                        hasDigits = true;
                        p++;
                    }
                    if (hasDigits) {
                        // We found a number!
                        // This is the ONLY substring allocation in the whole loop
                        const numStr = text.substring(numStart, p);
                        blockSourceLine = parseInt(numStr) - 1;
                        // Optimization: Skip the loop iterator forward to 'p'
                        // so we don't re-scan the digits
                        i = p - 1;
                    }
                }
            }
        }
    }
    // ⚡️ BINARY SEARCH LOOKUP
    findSourceLineForRtlLine(rtlLine) {
        let low = 0;
        let high = this.rtlBlocks.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const block = this.rtlBlocks[mid];
            if (rtlLine >= block.start && rtlLine <= block.end) {
                return block.sourceLine;
            }
            else if (rtlLine < block.start) {
                high = mid - 1;
            }
            else {
                low = mid + 1;
            }
        }
        return undefined;
    }
    // 🌈 FIXED: Paints BOTH editors now
    paintRainbow() {
        if (!this.rtlEditor || !this.sourceEditor)
            return;
        // Initialize empty arrays for both
        const sourceRanges = this.rainbowDecorations.map(() => []);
        const rtlRanges = this.rainbowDecorations.map(() => []);
        // Populate ranges
        this.sourceToRtlRanges.forEach((ranges, sourceLine) => {
            const colorIndex = sourceLine % this.rainbowDecorations.length;
            // Add Source Side
            sourceRanges[colorIndex].push(new vscode.Range(sourceLine, 0, sourceLine, 1000));
            // Add RTL Side (FIX: This was missing!)
            // "ranges" is the array of blocks in the RTL file that map to this source line
            if (ranges && ranges.length > 0) {
                rtlRanges[colorIndex].push(...ranges);
            }
        });
        // Apply decorations to BOTH editors
        for (let i = 0; i < this.rainbowDecorations.length; i++) {
            this.sourceEditor.setDecorations(this.rainbowDecorations[i], sourceRanges[i]);
            this.rtlEditor.setDecorations(this.rainbowDecorations[i], rtlRanges[i]);
        }
    }
    startSync() {
        if (this.disposable) {
            this.disposable.dispose();
        }
        this.disposable = vscode.window.onDidChangeTextEditorSelection(event => {
            if (!this.rtlEditor || !this.sourceEditor)
                return;
            // SCENARIO A: Click Source -> Highlight RTL
            if (event.textEditor === this.sourceEditor) {
                const currentSourceLine = event.selections[0].active.line;
                const ranges = this.sourceToRtlRanges.get(currentSourceLine);
                const sourceRange = new vscode.Range(currentSourceLine, 0, currentSourceLine, 1000);
                this.sourceEditor.setDecorations(this.activeDecoration, [sourceRange]);
                if (ranges && ranges.length > 0) {
                    this.rtlEditor.revealRange(ranges[0], vscode.TextEditorRevealType.InCenterIfOutsideViewport);
                    this.rtlEditor.setDecorations(this.activeDecoration, ranges);
                }
                else {
                    this.rtlEditor.setDecorations(this.activeDecoration, []);
                }
            }
            // SCENARIO B: Click RTL -> Highlight Source & CLEAR RTL Highlight
            else if (event.textEditor === this.rtlEditor) {
                const currentRtlLine = event.selections[0].active.line;
                const targetSourceLine = this.findSourceLineForRtlLine(currentRtlLine);
                this.rtlEditor.setDecorations(this.activeDecoration, []);
                if (targetSourceLine !== undefined) {
                    const range = new vscode.Range(targetSourceLine, 0, targetSourceLine, 1000);
                    this.sourceEditor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
                    this.sourceEditor.setDecorations(this.activeDecoration, [range]);
                }
                else {
                    this.sourceEditor.setDecorations(this.activeDecoration, []);
                }
            }
        });
    }
    dispose() {
        if (this.disposable)
            this.disposable.dispose();
        this.rainbowDecorations.forEach(d => d.dispose());
        this.activeDecoration.dispose();
    }
}
exports.SourceMapper = SourceMapper;
//# sourceMappingURL=sourceMapper.js.map