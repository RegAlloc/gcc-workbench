# Changelog

All notable changes to the "GCC Workbench" extension will be documented in this file.

---

### [2.0.0] - cregalloc@gmail.com - 2025-12-27
#### 🚀 Major Release: The Workbench Update
This release transforms the extension from a syntax highlighter into a full Integrated Development Environment (IDE) for GCC engineers.

#### Added
- **GCC Explorer:** A new sidebar view that automatically discovers and sorts GCC dump files (`.t`, `.r`, `.i`) chronologically by pass number.
- **Pass Surfing:** Navigation commands (`Ctrl+Alt+]` / `Ctrl+Alt+[`) to jump instantly to the next or previous compilation pass.
- **Diff-view:** "Compare with Previous Pass" button to visualize optimization changes without leaving the editor.
- **Focus Mode:** A toggleable "Noise Filter" (Eye Icon) to hide comments in RTL/GIMPLE dumps.
- **Graph Visualization:** One-click generation of Control Flow Graphs (CFG) from the current dump file.
- **Intelligent Navigation:**
    - **Go to Definition:** Support for jumping to attribute and iterator definitions within Machine Description (`.md`) files.
    - **RTL Hovers:** Rich documentation for standard RTL codes (e.g., `define_insn`, `set`) parsed directly from `rtl.def`.

#### Changed
- **Rebranding:** Extension display name changed from "GCC Syntax Highlighting" to **"GCC Workbench"**.
- Updated `README.md` to reflect new capabilities.
- improved startup performance by lazy-loading indexers.

#### Fixed
- Fixed an issue where "Go to Definition" would not work immediately upon VS Code startup.
- Fixed hover text formatting to correctly display multi-line documentation from C comments.

---

### [1.0.0] - cregalloc@gmail.com - 2025-12-13
#### Added
- Initial release.
- **Syntax Highlighting Support:**
    - Machine Description files (`.md`)
    - RTL Dumps (`.expand`, `.vregs`, `.r.*`)
    - GIMPLE Dumps (`.ssa`, `.optimized`, `.t.*`)
    - Match patterns (`match.pd`)
    - DejaGnu Expect scripts (`.exp`)
    - PowerPC/RS6000 Builtin definitions (`.def`)
    - GCC Option files (`.opt`)