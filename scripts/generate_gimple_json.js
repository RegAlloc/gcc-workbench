/*
 * Script to pre-compile GCC GIMPLE & TREE definitions into JSON.
 * Usage: node scripts/generate_gimple_json.js
 * * Features:
 * - Parses gimple.def (DEFGSCODE)
 * - Parses tree.def (DEFTREECODE)
 * - merges them into a single 'gimple_definitions.json'
 * - Preserves whitespace/indentation inside comments (Golden Rule)
 */

const fs = require('fs');
const path = require('path');

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_FILE = path.join(DATA_DIR, 'gimple_definitions.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
    console.error(`Error: 'data' directory not found at ${DATA_DIR}`);
    process.exit(1);
}

// Global Definitions Map
const definitions = {};

// ----------------------------------------------------------------------------
// 1. Helper: Text Formatter (Golden Rule: Preserve Spaces)
// ----------------------------------------------------------------------------
function formatComment(rawLines) {
    return rawLines
        .map(line => {
            // Remove /* and preceding whitespace
            let clean = line.replace(/^\s*\/\*+/, '');
            
            // Remove */ and trailing whitespace
            clean = clean.replace(/\*+\/\s*$/, '');
            
            // Remove leading '*' decoration common in C blocks (e.g. " * Text")
            // Crucial: We replace `^\s*\*\s?` which removes the star and ONE space.
            // Any extra spaces after that are PRESERVED.
            clean = clean.replace(/^\s*\*\s?/, '');

            return clean;
        })
        .filter((line, index, arr) => {
            // Remove empty lines only from the absolute start/end
            if (line.trim() === '' && (index === 0 || index === arr.length - 1)) return false;
            return true;
        })
        .join('  \n'); // Markdown Hard Break
}

// ----------------------------------------------------------------------------
// 2. Helper: Documentation Extractor (Golden Rule: Shared Docs)
// ----------------------------------------------------------------------------
function extractDoc(lines, currentIndex, isDefFn, normalizeKeyFn) {
    // Look Backwards
    for (let j = currentIndex - 1; j >= 0; j--) {
        const prevLine = lines[j].trim();

        if (prevLine === '') break; // Empty line breaks the chain
        if (prevLine.startsWith('#')) continue;

        // CASE A: Inheritance (Shared Documentation)
        if (isDefFn(prevLine)) {
            const rawName = isDefFn(prevLine);
            if (rawName) {
                const prevKey = normalizeKeyFn(rawName);
                if (definitions[prevKey]) {
                    return definitions[prevKey]; // Return the parent's doc
                }
            }
            continue;
        }

        // CASE B: Found a Comment Block
        if (prevLine.endsWith('*/')) {
            let commentLines = [];
            // Scan backwards for the start of the comment /*
            for (let k = j; k >= 0; k--) {
                const commentLine = lines[k]; // Keep original indentation
                commentLines.unshift(commentLine);
                if (commentLine.trim().startsWith('/*')) break;
            }
            return formatComment(commentLines);
        }
    }
    return undefined;
}

// ----------------------------------------------------------------------------
// 3. Parsers
// ----------------------------------------------------------------------------

function parseGimpleDef() {
    const filePath = path.join(DATA_DIR, 'gimple.def');
    if (!fs.existsSync(filePath)) return console.warn('Warning: gimple.def not found.');

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Regex: DEFGSCODE(ENUM, "string_name", ...)
    // We want the "string_name" (Group 2) as the key
    const regex = /DEFGSCODE\s*\(\s*[A-Z0-9_]+\s*,\s*"([^"]+)"/;
    
    const checkDef = (line) => {
        const m = regex.exec(line);
        return m ? m[1] : null; // "gimple_cond"
    };
    
    // Key is already the string name, so just return it
    const normKey = (name) => name;

    lines.forEach((line, i) => {
        const name = checkDef(line);
        if (name) {
            const doc = extractDoc(lines, i, checkDef, normKey);
            definitions[name] = doc || `**${name}**`;
        }
    });
    console.log(`Parsed gimple.def`);
}

function parseTreeDef() {
    const filePath = path.join(DATA_DIR, 'tree.def');
    if (!fs.existsSync(filePath)) return console.warn('Warning: tree.def not found.');

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Regex: DEFTREECODE(ENUM, "string_name", ...)
    const regex = /DEFTREECODE\s*\(\s*[A-Z0-9_]+\s*,\s*"([^"]+)"/;

    const checkDef = (line) => {
        const m = regex.exec(line);
        return m ? m[1] : null; // "plus_expr"
    };
    
    const normKey = (name) => name;

    lines.forEach((line, i) => {
        const name = checkDef(line);
        if (name) {
            const doc = extractDoc(lines, i, checkDef, normKey);
            definitions[name] = doc || `**${name}**`;
        }
    });
    console.log(`Parsed tree.def`);
}

// ----------------------------------------------------------------------------
// 4. Execution
// ----------------------------------------------------------------------------

parseGimpleDef();
parseTreeDef();

fs.writeFileSync(OUT_FILE, JSON.stringify(definitions, null, 2));
console.log(`\nSuccessfully generated ${OUT_FILE}`);
console.log(`Total Definitions: ${Object.keys(definitions).length}`);