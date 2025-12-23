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
exports.RtlDefCache = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class RtlDefCache {
    definitions = new Map();
    async initialize(context) {
        const rtlDefPath = context.asAbsolutePath(path.join('src', 'rtl.def'));
        if (!fs.existsSync(rtlDefPath))
            return;
        const content = await fs.promises.readFile(rtlDefPath, 'utf8');
        this.parseRtlDef(content);
    }
    getExplanation(name) {
        return this.definitions.get(name);
    }
    parseRtlDef(content) {
        const lines = content.split('\n');
        // Helper to check if a line looks like a definition
        const isDef = (line) => line.trim().startsWith('DEF_RTL_EXPR');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // We only care when we hit a Definition
            if (isDef(line)) {
                const match = /DEF_RTL_EXPR\s*\(\s*[A-Z0-9_]+,\s*"([^"]+)"/.exec(line);
                if (!match)
                    continue;
                const name = match[1]; // e.g. "set"
                // --- LOOK BEHIND LOGIC ---
                // Scan backwards from this line to find docs
                let doc = undefined;
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
                        const commentLines = [];
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
    formatComment(rawLines) {
        return rawLines
            .map(line => {
            let clean = line.trim();
            clean = clean.replace(/^\/\*+/, '').replace(/\*+\/$/, ''); // Remove /* and */
            clean = clean.replace(/^\*+\s?/, '').trim(); // Remove leading *
            return clean;
        })
            .filter((line, index, arr) => {
            // Remove empty lines only from edges
            if (line === '' && (index === 0 || index === arr.length - 1))
                return false;
            return true;
        })
            .join('  \n'); // Markdown Hard Break
    }
}
exports.RtlDefCache = RtlDefCache;
//# sourceMappingURL=rtlCache.js.map