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
exports.RtlDefCache = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class RtlDefCache {
    // Stores "REG_DEAD" -> "Description..."
    // Initialized empty so it consumes almost no memory until activated
    definitions = new Map();
    isInitialized = false;
    async initialize(context) {
        if (this.isInitialized)
            return;
        // We look for the pre-compiled JSON file in the 'data' folder
        const jsonPath = context.asAbsolutePath(path.join('data', 'rtl_definitions.json'));
        if (fs.existsSync(jsonPath)) {
            try {
                // FAST: Load one JSON file into memory
                const content = await fs.promises.readFile(jsonPath, 'utf8');
                const data = JSON.parse(content);
                // Bulk load the map from the JSON object
                this.definitions = new Map(Object.entries(data));
                this.isInitialized = true;
                // Debug log (Optional: remove before release)
                // console.log(`GCC Workbench: Loaded ${this.definitions.size} RTL definitions.`);
            }
            catch (e) {
                console.error('GCC Workbench: Failed to parse rtl_definitions.json', e);
            }
        }
        else {
            console.warn(`GCC Workbench: RTL Definitions file not found at ${jsonPath}`);
        }
    }
    // 🚀 FAST PATH: This is what runs when you hover
    // No file checks, no parsing. Just a Map lookup.
    getExplanation(name) {
        return this.definitions.get(name);
    }
}
exports.RtlDefCache = RtlDefCache;
//# sourceMappingURL=rtlCache.js.map