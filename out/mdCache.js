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
exports.GccMdCache = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
class BackendContext {
    symbols = new Map();
    wordFilesMap = new Map();
    processingFiles = new Set();
    // 🚀 OPTIMIZATION 1: Cache the common path result
    // undefined = not checked yet, null = checked and not found, string = found
    commonMdPath = undefined;
    clear() {
        this.symbols.clear();
        this.wordFilesMap.clear();
        this.processingFiles.clear();
        this.commonMdPath = undefined; // Reset cache on clear
    }
}
class GccMdCache {
    contexts = new Map();
    ignoredKeywords = new Set([
        'match_operand', 'match_scratch', 'match_dup', 'match_operator',
        'match_parallel', 'clobber', 'use', 'set', 'const_int', 'const_string'
    ]);
    getContext(uri) {
        const dir = path.dirname(uri.fsPath);
        if (!this.contexts.has(dir))
            this.contexts.set(dir, new BackendContext());
        return this.contexts.get(dir);
    }
    // 🚀 OPTIMIZATION 2: Run this logic ONLY when needed
    findCommonMdPath(startDir) {
        let current = startDir;
        // Limit search depth to avoid endless loops on weird file systems
        for (let i = 0; i < 5; i++) {
            const candidate = path.join(current, 'common.md');
            try {
                // fs.existsSync is fine here because we only run it ONCE per session
                if (fs.existsSync(candidate))
                    return candidate;
            }
            catch { /* ignore permission errors */ }
            const parent = path.dirname(current);
            if (parent === current)
                break;
            current = parent;
        }
        return null;
    }
    async indexFile(uri, parentCtx) {
        const ctx = parentCtx || this.getContext(uri);
        const filePath = uri.fsPath;
        if (ctx.processingFiles.has(filePath))
            return;
        ctx.processingFiles.add(filePath);
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            // 1. Clean old symbols for this file
            for (const [key, syms] of ctx.symbols.entries()) {
                const filtered = syms.filter(s => s.uri.fsPath !== filePath);
                if (filtered.length > 0)
                    ctx.symbols.set(key, filtered);
                else
                    ctx.symbols.delete(key);
            }
            // 2. Index content
            const defRegex = /\(define_(attr|predicate|special_predicate|constraint|register_constraint|memory_constraint|address_constraint|c_enum|enum|constants)\s+"([^"]+)"|\(define_([a-z]+)_(iterator|attr)\s+([a-zA-Z0-9_]+)\b|\(\s*([a-zA-Z0-9_]+)\s+([0-x0-9a-fA-F-]+)\s*\)/g;
            let match;
            // 🚀 OPTIMIZATION 3: Yield to event loop occasionally for large files
            let loopCounter = 0;
            while ((match = defRegex.exec(content)) !== null) {
                // Every 50 matches, let the UI thread breathe
                if (++loopCounter % 50 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
                const textBeforeMatch = content.substring(0, match.index);
                const lastNewLine = textBeforeMatch.lastIndexOf('\n');
                const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
                const linePrefix = content.substring(lineStart, match.index).trim();
                if (linePrefix.startsWith(';') || linePrefix.includes(';'))
                    continue;
                let name = '';
                let type = 'attribute';
                if (match[2]) {
                    name = match[2];
                    const t = match[1];
                    if (t.includes('constraint'))
                        type = 'constraint';
                    else if (t.includes('predicate'))
                        type = 'predicate';
                    else if (t === 'attr')
                        type = 'attribute';
                    else if (t === 'c_enum')
                        type = 'unspec';
                }
                else if (match[5]) {
                    name = match[5];
                    const kind = match[4];
                    type = kind === 'iterator' ? 'iterator' : 'attribute';
                }
                else if (match[6]) {
                    name = match[6];
                    type = 'constant';
                }
                if (!name || this.ignoredKeywords.has(name))
                    continue;
                // Comment Extraction
                const lines = textBeforeMatch.split('\n');
                const lineNum = lines.length - 1;
                let comments = [];
                for (let i = lineNum - 1; i >= 0; i--) {
                    const l = lines[i].trim();
                    if (l === '')
                        break;
                    if (l.startsWith(';'))
                        comments.unshift(l.replace(/^;+\s*/, ''));
                    else
                        break;
                }
                const newSymbol = {
                    definition: content.substring(match.index).split(')')[0] + ')',
                    comments: comments.join('\n'),
                    uri: uri,
                    line: lineNum,
                    character: lines[lineNum].length,
                    type: type
                };
                if (!ctx.symbols.has(name))
                    ctx.symbols.set(name, []);
                ctx.symbols.get(name).push(newSymbol);
                // Handle Includes
                if (match[0].includes('include')) {
                    const incMatch = /\(include\s+"([^"]+)"\)/.exec(match[0]);
                    if (incMatch) {
                        const incPath = path.resolve(path.dirname(filePath), incMatch[1]);
                        if (fs.existsSync(incPath)) {
                            await this.indexFile(vscode.Uri.file(incPath), ctx);
                        }
                    }
                }
            }
            // Reverse Index
            const words = new Set(content.split(/[^a-zA-Z0-9_]+/));
            words.forEach(word => {
                if (!ctx.wordFilesMap.has(word))
                    ctx.wordFilesMap.set(word, new Set());
                ctx.wordFilesMap.get(word).add(filePath);
            });
        }
        catch (e) {
            console.error(`Index Error: ${filePath}`, e);
        }
        finally {
            ctx.processingFiles.delete(filePath);
        }
    }
    // 🚀 OPTIMIZATION 4: Zero I/O in Hot Path
    getAllSymbols(uri, name) {
        const results = [];
        const startDir = path.dirname(uri.fsPath);
        // 1. Get Context (Fast Map Lookup)
        const localCtx = this.contexts.get(startDir);
        if (localCtx) {
            const s = localCtx.symbols.get(name);
            if (s)
                results.push(...s);
            // 2. Check Common Path (Using Cache)
            if (localCtx.commonMdPath === undefined) {
                // First time? Calculate and cache it.
                localCtx.commonMdPath = this.findCommonMdPath(startDir);
            }
            // If we have a common path, look it up in THAT context
            if (localCtx.commonMdPath) {
                const commonDir = path.dirname(localCtx.commonMdPath);
                const commonCtx = this.contexts.get(commonDir);
                // We only check if the context exists (it might be indexed separately)
                if (commonCtx) {
                    const s = commonCtx.symbols.get(name);
                    if (s)
                        results.push(...s);
                }
            }
        }
        return results;
    }
    getFilesWithWord(uri, word) {
        const ctx = this.getContext(uri);
        return Array.from(ctx.wordFilesMap.get(word) || []);
    }
    async forceReindex(uri) {
        const dir = path.dirname(uri.fsPath);
        const ctx = this.getContext(uri);
        ctx.clear();
        // Recalculate common path on reindex
        ctx.commonMdPath = this.findCommonMdPath(dir);
        const files = await fs.promises.readdir(dir);
        await Promise.all(files.filter(f => f.endsWith('.md'))
            .map(f => this.indexFile(vscode.Uri.file(path.join(dir, f)))));
        if (ctx.commonMdPath)
            await this.indexFile(vscode.Uri.file(ctx.commonMdPath));
    }
}
exports.GccMdCache = GccMdCache;
//# sourceMappingURL=mdCache.js.map