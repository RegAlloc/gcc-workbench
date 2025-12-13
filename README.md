# GCC Syntax Highlighting – GCC internals in color

**Extension version:** 1.0.0

This repository contains a Visual Studio Code / VSCodium extension that adds syntax highlighting for **GCC internals**.
It is aimed at people working on GCC itself or regularly reading GCC dumps.

## License

This project is licensed under the **GNU General Public License v3.0 or later (GPL-3.0-or-later)**.

See the [LICENSE](./LICENSE) file for details.

### Credits & Legal
* **DejaGnu expect scripts (.exp) Syntax:** The syntax highlighting for `.exp` files in this extension is a derivative work based on the [vscode-tcl](https://github.com/bitwisecook/vscode-tcl/tree/master) repository by **James Deucker** (Copyright (c) 2019), which is licensed under the **MIT License**.
    * *Modifications:* The original YAML logic was converted to JSON and adapted for GCC DejaGnu expect scripts by Kishan Parmar in 2025.
* **All other files:** Original work licensed under GPL-3.0-or-later.

---

## What this is useful for

When hacking on GCC, you often need to read and understand complex internal formats. Reading all of this as plain, uncolored text is painful. This extension provides TextMate grammars to support the following:

### 1. Machine Description Files (`.md`)
* **Constructs:** `define_insn`, `define_expand`, `define_split`, `define_peephole2`, iterators, attributes, `match_operand`, and RTL patterns.
* **Embedded Code:** Highlights C/C++ blocks embedded inside MD files.
* **Operands:** Distinct coloring for registers, modes, and constraints.

### 2. RTL Dumps (`.expand`, `.vregs`, etc.)
* **Records:** `insn`, `jump_insn`, `call_insn`, `note`, `barrier`, `code_label`, `debug_insn`.
* **Structure:** `set`, `parallel`, `clobber`, `use`, plus arithmetic and logical RTL operators.
* **Data:** Registers (`reg:DI 3`), vector modes, `const_int`, and other constants.

### 3. GIMPLE Dumps (`.ssa`, `.optimized`, etc.)
* **Control Flow:** Basic block headers (`<bb 3>`) and metadata.
* **Statements:** `gimple_call`, `gimple_assign`, `gimple_cond`, `gimple_switch`, `gimple_label`.
* **Dataflow:** PHI nodes and SSA names are highlighted to easily trace data flow.

### 4. `match.pd` Patterns
* **Rules:** `match` / `simplify` rules and helper definitions.
* **Trees:** Operator trees (e.g., `plus`, `mult`, `bit_and`, `lshift`, `cond`, `vec_perm`, `fma`).
* **Captures:** Highlights captures like `@x` and `@@y`, along with embedded C/C++ action code.

### 5. PowerPC/RS6000 Builtins
* Specific highlighting for `rs6000-builtin.def` files and related 6000-series definitions.

### 6. Option files (.opt)

### 7. DejaGnu expect scripts (.exp)

---

## Syntax Highlighting Preview

### Match Pattern (`match.pd`)
![Match Pattern Preview](pictures/Match.png)

### GCC Machine Description (`.md`)
![GCC Machine Description Preview](pictures/GCC-Machine-Description.png)

---

### Project Status & Contributing

My foundational work on this extension is complete. The project is now open for the community to utilize, maintain, and evolve.

* **Found a bug?**
    Please raise an issue on the issue tracker:
    [https://github.com/RegAlloc/gcc-syntax-highlighting/issues](https://github.com/RegAlloc/gcc-syntax-highlighting/issues)

* **Want to contribute?**
    Everyone is welcome to continue or expand on this project. Feel free to fork the repository and raise a Pull Request here:
    [https://github.com/RegAlloc/gcc-syntax-highlighting](https://github.com/RegAlloc/gcc-syntax-highlighting)

### Publisher Trust & Security

This extension is open-source and published by Kishan Parmar.

Source code is publicly available on GitHub and can be audited by anyone.

No telemetry, tracking, or data collection is performed by this extension.