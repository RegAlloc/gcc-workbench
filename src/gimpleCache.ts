/*
 * Copyright (C) 2026 Kishan Parmar
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

export class GimpleCache {
  // Stores "gimple_cond" -> "Description..."
  private definitions = new Map<string, string>();
  private isInitialized = false;

  public async initialize(context: vscode.ExtensionContext) {
    if (this.isInitialized) return;

    // Load the GIMPLE JSON
    const jsonPath = context.asAbsolutePath(path.join('data', 'gimple_definitions.json'));

    if (fs.existsSync(jsonPath)) {
      try {
        const content = await fs.promises.readFile(jsonPath, 'utf8');
        const data = JSON.parse(content);

        // Bulk load
        this.definitions = new Map(Object.entries(data));
        this.isInitialized = true;
      } catch (e) {
        console.error('GCC Workbench: Failed to parse gimple_definitions.json', e);
      }
    }
  }

  // Fast Lookup
  public getExplanation(name: string): string|undefined {
    return this.definitions.get(name);
  }
}