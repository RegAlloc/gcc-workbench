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

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class RtlDefCache {
  // Stores "REG_DEAD" -> "Description..."
  // Initialized empty so it consumes almost no memory until activated
  private definitions = new Map<string, string>();
  private isInitialized = false;

  public async initialize(context: vscode.ExtensionContext) {
    if (this.isInitialized) return;

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

      } catch (e) {
        console.error('GCC Workbench: Failed to parse rtl_definitions.json', e);
      }
    } else {
      console.warn(`GCC Workbench: RTL Definitions file not found at ${jsonPath}`);
    }
  }

  // 🚀 FAST PATH: This is what runs when you hover
  // No file checks, no parsing. Just a Map lookup.
  public getExplanation(name: string): string|undefined {
    return this.definitions.get(name);
  }
}