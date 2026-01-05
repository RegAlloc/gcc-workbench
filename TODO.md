

## ToDo features

- RTL, click instruction to jump to definition in .md
- The "Liveness" Heatmap (Register Allocation Focus)
	- The Idea: A "Heatmap" in the editor gutter (next to line numbers).
	- The Logic: We crudely count the number of active pseudos between defs and deaths.
	- The Output: The gutter color changes from Green (low pressure) to Red (high pressure) as you scroll through the function.
	- Why: You can spot "Spill Zones" instantly just by scrolling.
