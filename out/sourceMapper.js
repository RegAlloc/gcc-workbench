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
exports.SourceMapper = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// 🎨 LAYER 1: RAINBOW (Structure)
// Kept very low opacity (0.03) to just give a hint of structure.
const rainbowPalette = [
    'rgba(255, 0, 0, 0.03)', 'rgba(0, 255, 0, 0.03)', 'rgba(0, 0, 255, 0.03)',
    'rgba(255, 255, 0, 0.03)', 'rgba(0, 255, 255, 0.03)', 'rgba(255, 0, 255, 0.03)',
    'rgba(192, 192, 192, 0.03)', 'rgba(128, 0, 0, 0.03)', 'rgba(128, 128, 0, 0.03)',
    'rgba(0, 128, 0, 0.03)', 'rgba(128, 0, 128, 0.03)', 'rgba(0, 128, 128, 0.03)',
    'rgba(0, 0, 128, 0.03)', 'rgba(255, 99, 71, 0.03)', 'rgba(255, 165, 0, 0.03)',
    'rgba(255, 215, 0, 0.03)', 'rgba(189, 183, 107, 0.03)', 'rgba(238, 130, 238, 0.03)',
    'rgba(106, 90, 205, 0.03)', 'rgba(173, 216, 230, 0.03)', 'rgba(95, 158, 160, 0.03)',
    'rgba(60, 179, 113, 0.03)', 'rgba(154, 205, 50, 0.03)', 'rgba(210, 105, 30, 0.03)',
    'rgba(165, 42, 42, 0.03)', 'rgba(220, 20, 60, 0.03)', 'rgba(255, 192, 203, 0.03)',
    'rgba(219, 112, 147, 0.03)', 'rgba(240, 230, 140, 0.03)', 'rgba(255, 228, 196, 0.03)',
    'rgba(245, 222, 179, 0.03)', 'rgba(112, 128, 144, 0.03)'
];
class SourceMapper {
    context;
    rtlEditor;
    sourceEditor;
    // 🎨 LAYER 2: ACTIVE HIGHLIGHT (The "Godbolt" Cyan)
    // FIX: Opacity reduced to 0.1 (Was 0.25).
    // This makes it a subtle highlight rather than a neon block.
    activeDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(0, 255, 255, 0.1)', // Subtle Cyan
        isWholeLine: true,
        borderWidth: '0 0 0 3px', // Left Marker
        borderColor: 'rgba(0, 255, 255, 0.6)', // Solid Border
        borderStyle: 'solid'
    });
    rainbowDecorations = [];
    sourceToRtlMap = new Map(); // Source Line -> [RTL Ranges] (Wait, we need precise ranges now)
    sourceToRtlRanges = new Map(); // Better mapping
    rtlToSourceMap = new Map();
    disposable;
    constructor(context) {
        this.context = context;
        this.rainbowDecorations = rainbowPalette.map(color => vscode.window.createTextEditorDecorationType({ backgroundColor: color, isWholeLine: true }));
    }
    async enable(activeEditor) {
        this.rtlEditor = activeEditor;
        const rtlDoc = this.rtlEditor.document;
        const text = rtlDoc.getText();
        // 1. Path Resolution (Standard)
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
        // 2. Build Precise Mapping (Parenthesis Aware)
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
    // 🧠 THE PARENTHESIS PARSER
    // This Logic strictly follows S-Expressions. It ignores logs/noise.
    buildMapping(rtlText) {
        this.sourceToRtlRanges.clear();
        this.rtlToSourceMap.clear();
        const lines = rtlText.split('\n');
        const locRegex = /"([^"]+)":(\d+):(\d+)/;
        let balance = 0;
        let startLine = -1;
        let hasStarted = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Count Parentheses in this line
            let openCount = 0;
            let closeCount = 0;
            for (const char of line) {
                if (char === '(')
                    openCount++;
                if (char === ')')
                    closeCount++;
            }
            // Start of a new S-Expression?
            // Must start with '(' and we must be currently balanced (0)
            if (!hasStarted && line.trim().startsWith('(')) {
                startLine = i;
                hasStarted = true;
                balance = 0; // Reset
            }
            if (hasStarted) {
                balance += (openCount - closeCount);
                // Check if this specific line has a Source Marker
                const match = locRegex.exec(line);
                if (match) {
                    // GCC line numbers are 1-based, VS Code is 0-based
                    const sLine = parseInt(match[2]) - 1;
                    // We map the *Current S-Expression* so far to this source line.
                    // But we wait until the expression closes to finalize the range.
                    // Store the 'pending' source line in a temporary way? 
                    // Actually, usually the marker is inside the block. 
                    // We can just tag this block index `startLine` as belonging to `sLine`.
                    // We need to map individual lines for the Reverse Lookup (RTL -> Source)
                    this.rtlToSourceMap.set(i, sLine);
                }
                // End of S-Expression?
                if (balance === 0 && startLine !== -1) {
                    // The block is [startLine, i]
                    // Scan the block text again to find the source line (to be sure)
                    // (Optimization: we could have stored it above, but scanning 5 lines is cheap)
                    let foundSourceLine = -1;
                    for (let j = startLine; j <= i; j++) {
                        const m = locRegex.exec(lines[j]);
                        if (m) {
                            foundSourceLine = parseInt(m[2]) - 1;
                            break;
                        }
                    }
                    if (foundSourceLine !== -1) {
                        if (!this.sourceToRtlRanges.has(foundSourceLine)) {
                            this.sourceToRtlRanges.set(foundSourceLine, []);
                        }
                        // Add this PRECISE range
                        this.sourceToRtlRanges.get(foundSourceLine).push(new vscode.Range(startLine, 0, i, 1000));
                        // Map all lines in this range to the source (for clicking RTL)
                        for (let k = startLine; k <= i; k++) {
                            this.rtlToSourceMap.set(k, foundSourceLine);
                        }
                    }
                    // Reset for next block
                    hasStarted = false;
                    startLine = -1;
                }
            }
        }
    }
    paintRainbow() {
        if (!this.rtlEditor || !this.sourceEditor)
            return;
        const sourceRanges = this.rainbowDecorations.map(() => []);
        // We can't easily rainbow the RTL side with ranges efficiently in this new mode 
        // without recalculating. For now, let's rainbow the Source side primarily 
        // to show structure.
        // Actually, let's skip rainbow on RTL to keep it clean as requested ("Too bright").
        // We will only rainbow the C Code to show "Block 1", "Block 2".
        this.sourceToRtlRanges.forEach((ranges, sourceLine) => {
            const colorIndex = sourceLine % this.rainbowDecorations.length;
            sourceRanges[colorIndex].push(new vscode.Range(sourceLine, 0, sourceLine, 1000));
        });
        for (let i = 0; i < this.rainbowDecorations.length; i++) {
            this.sourceEditor.setDecorations(this.rainbowDecorations[i], sourceRanges[i]);
            // this.rtlEditor.setDecorations(this.rainbowDecorations[i], rtlRanges[i]); // Disabled for cleanliness
        }
    }
    startSync() {
        if (this.disposable) {
            this.disposable.dispose();
        }
        this.disposable = vscode.window.onDidChangeTextEditorSelection(event => {
            if (!this.rtlEditor || !this.sourceEditor)
                return;
            // SCENARIO A: Click Source -> Highlight RTL (Precise Block)
            if (event.textEditor === this.sourceEditor) {
                const currentSourceLine = event.selections[0].active.line;
                const ranges = this.sourceToRtlRanges.get(currentSourceLine);
                // Highlight Source
                const sourceRange = new vscode.Range(currentSourceLine, 0, currentSourceLine, 1000);
                this.sourceEditor.setDecorations(this.activeDecoration, [sourceRange]);
                // Highlight RTL
                if (ranges && ranges.length > 0) {
                    this.rtlEditor.revealRange(ranges[0], vscode.TextEditorRevealType.InCenterIfOutsideViewport);
                    this.rtlEditor.setDecorations(this.activeDecoration, ranges);
                }
                else {
                    this.rtlEditor.setDecorations(this.activeDecoration, []);
                }
            }
            // SCENARIO B: Click RTL -> Highlight Source & CLEAR RTL
            else if (event.textEditor === this.rtlEditor) {
                const currentRtlLine = event.selections[0].active.line;
                const targetSourceLine = this.rtlToSourceMap.get(currentRtlLine);
                // CLEAR RTL Highlights immediately (As requested: "block should go away")
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