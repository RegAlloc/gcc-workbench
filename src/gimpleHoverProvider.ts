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

import * as vscode from 'vscode';
import { GimpleCache } from './gimpleCache';

export class GimpleHoverProvider implements vscode.HoverProvider {
  constructor(private cache: GimpleCache) {}

  public provideHover(
      document: vscode.TextDocument,
      position: vscode.Position
  ): vscode.Hover|null {
    
    // 1. Get word under cursor
    const range = document.getWordRangeAtPosition(position);
    if (!range) return null;
    
    const word = document.getText(range);

    // 2. Lookup in Cache
    const explanation = this.cache.getExplanation(word);

    if (explanation) {
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`#### 🇬 **${word}**\n`);
      markdown.appendMarkdown(explanation);
      return new vscode.Hover(markdown);
    }

    return null;
  }
}