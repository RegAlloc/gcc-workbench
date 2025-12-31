/*
 * Script to pre-compile GCC definitions into JSON.
 * Usage: node scripts/generate_rtl_json.js
 */

const fs = require('fs');
const path = require('path');

// Paths configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_FILE = path.join(DATA_DIR, 'rtl_definitions.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
    console.error(`Error: 'data' directory not found at ${DATA_DIR}`);
    process.exit(1);
}

const definitions = {};

function formatComment(rawLines) {
    return rawLines
        .map(line => {
            let clean = line.trim();
            clean = clean.replace(/^\/\*+/, '').replace(/\*+\/$/, ''); // Strip start/end /* */
            clean = clean.replace(/^\*+\s?/, '').trim(); // Strip leading *
            return clean;
        })
        .filter((line, index, arr) => {
            // Remove empty lines only from very start/end
            if (line === '' && (index === 0 || index === arr.length - 1)) return false;
            return true;
        })
        .join('  \n'); // Markdown Hard Break (Space Space Newline)
}

function parseRtlDef() {
    const filePath = path.join(DATA_DIR, 'rtl.def');
    if (!fs.existsSync(filePath)) {
        console.warn('Warning: rtl.def not found.');
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const defRegex = /DEF_RTL_EXPR\s*\(\s*[A-Z0-9_]+,\s*"([^"]+)"/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('DEF_RTL_EXPR')) {
            const match = defRegex.exec(line);
            if (match) {
                const name = match[1];
                let docLines = [];
                let j = i - 1;

                // Skip blank lines above definition
                while (j >= 0 && lines[j].trim() === '') j--;

                // Parse C-style comment block
                if (j >= 0 && lines[j].trim().endsWith('*/')) {
                    let insideComment = true;
                    while (j >= 0 && insideComment) {
                        let commentLine = lines[j].trim();
                        if (commentLine.endsWith('*/')) commentLine = commentLine.substring(0, commentLine.length - 2);
                        if (commentLine.startsWith('/*')) {
                            commentLine = commentLine.substring(2);
                            insideComment = false;
                        }
                        commentLine = commentLine.replace(/^\s*\*\s?/, ''); // Strip leading *
                        
                        // Keep text, preserving empty lines for paragraph structure
                        docLines.unshift(commentLine);
                        j--;
                    }
                }

                if (docLines.length > 0) {
                    definitions[name] = formatComment(docLines); // Using our helper to join with markdown breaks
                } else {
                    definitions[name] = `**${name}**`;
                }
            }
        }
    }
    console.log(`Parsed rtl.def: Found entries.`);
}

function parseRegNotes() {
    const filePath = path.join(DATA_DIR, 'reg-notes.def');
    if (!fs.existsSync(filePath)) {
        console.warn('Warning: reg-notes.def not found.');
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const isDef = (line) => /^(REG_NOTE|REG_CFA_NOTE)\s*\(/.test(line.trim());

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (isDef(line)) {
            const match = /(?:REG_NOTE|REG_CFA_NOTE)\s*\(\s*([A-Z0-9_]+)\s*\)/.exec(line);
            if (match) {
                const rawName = match[1];
                const name = "REG_" + rawName; // Normalize to REG_DEAD

                // Extract Doc
                let doc = undefined;
                for (let j = i - 1; j >= 0; j--) {
                    const prevLine = lines[j].trim();
                    if (prevLine === '') break;
                    if (prevLine.startsWith('#')) continue;

                    // Inherit from parent definition
                    if (isDef(prevLine)) {
                        let prevName = '';
                        const m = /(?:REG_NOTE|REG_CFA_NOTE)\s*\(\s*([A-Z0-9_]+)\s*\)/.exec(prevLine);
                        if (m) prevName = "REG_" + m[1];
                        if (prevName && definitions[prevName]) doc = definitions[prevName];
                        break;
                    }

                    // Found comment block
                    if (prevLine.endsWith('*/')) {
                        let commentLines = [];
                        for (let k = j; k >= 0; k--) {
                            const cl = lines[k].trim();
                            commentLines.unshift(cl);
                            if (cl.startsWith('/*')) break;
                        }
                        doc = formatComment(commentLines); // Reuse helper
                        break;
                    }
                }

                if (doc) definitions[name] = doc;
            }
        }
    }
    console.log(`Parsed reg-notes.def: Found entries.`);
}

// Run parsers
parseRtlDef();
parseRegNotes();

// Write to JSON
fs.writeFileSync(OUT_FILE, JSON.stringify(definitions, null, 2));
console.log(`Successfully generated ${OUT_FILE}`);
