---
name: jupyter-notebook-crafter
description: Create complete, refined, and runnable bioinformatics notebooks with emphasis on docking and molecular dynamics in Python.
---

# Bioinformatics Notebook Crafter

Use this skill when the user wants a new notebook, wants an existing notebook improved, or needs code transformed into a clean `.ipynb` for bioinformatics work, especially docking and molecular dynamics.

## Goals

- Produce notebooks that are runnable from top to bottom.
- Make the notebook feel polished, not like a code dump.
- Prefer practical explanations, realistic safeguards, and sensible defaults.
- Leave the notebook in a state where a teammate can open it and understand the workflow quickly.
- Emphasize scientific reproducibility, transparent assumptions, and interpretation of results.

## Workflow

1. Inspect the repo, datasets, scripts, and environment before writing notebook cells.
2. Decide the notebook's audience and purpose:
   - docking analysis
   - molecular dynamics analysis
   - bioinformatics tutorial
   - reproducible report
3. Build a clear outline before filling in code:
   - title and objective
   - scientific context and assumptions
   - environment/setup notes
   - imports and configuration
   - input structures, trajectories, or tables
   - core analysis or implementation
   - validation, metrics, or checks
   - conclusions and next steps
4. Write notebook cells in a deliberate order so execution is linear and reproducible.
5. Keep markdown concise but polished. Explain why steps matter, not just what the code does.
6. Validate the notebook JSON and scan for unfinished placeholders with `scripts/notebook_quality_check.py`.

## Notebook standards

- Start with a strong markdown title cell that explains the notebook's purpose.
- Prefer small, focused code cells over giant blocks.
- Include imports explicitly rather than assuming hidden state.
- When randomness exists, set a seed.
- When file paths are used, make them relative to the project when possible.
- Add guardrails for common failure modes such as missing files, missing columns, or empty results.
- Capture package versions when the notebook relies on specialized scientific libraries.
- End with a summary cell that states conclusions, outputs, or recommended next actions.
- Remove filler such as "TODO", "lorem ipsum", or unexplained placeholder text.

## Domain standards

- Prefer Python-native scientific tooling such as `pandas`, `numpy`, `matplotlib`, `seaborn`, `biopython`, `MDAnalysis`, `nglview`, `rdkit`, or `openmm` when the repo supports them.
- State clearly whether the notebook is doing structure preparation, post-processing, visualization, or interpretation rather than claiming to run a full simulation pipeline if the inputs are not present.
- Distinguish between exploratory observations and defensible scientific conclusions.
- Include file provenance for receptor, ligand, topology, and trajectory inputs whenever possible.

## Docking notebooks

- Include sections for receptor and ligand inputs, preparation assumptions, search space or docking setup, score inspection, pose ranking, and limitations.
- When docking results are already available, focus on parsing, ranking, visualization, and comparison instead of pretending to run a docking engine locally.
- Highlight score caveats, protonation assumptions, and the need for visual inspection of top poses.

## Molecular dynamics notebooks

- Include sections for topology and trajectory loading, simulation metadata, RMSD, RMSF, distance/contact analysis, and convergence caveats.
- Prefer post-processing and interpretation unless the repo truly contains simulation setup files and the necessary engines.
- When possible, add checks for frame counts, atom selections, missing topology files, and unit consistency.

## Editing guidance

- If converting an existing script into a notebook, preserve the core logic but restructure it into teachable sections.
- If the task is docking, keep structure preparation, score interpretation, and pose analysis separated.
- If the task is molecular dynamics, separate trajectory loading, feature extraction, and interpretation.
- If the task is instructional, favor readability and narrative transitions over compactness.

## Helper scripts

- `scripts/new_notebook.py`
  - Generates starter notebooks for `generic`, `docking`, and `molecular-dynamics` workflows.
- `scripts/notebook_quality_check.py`
  - Validates notebook JSON structure and flags obvious quality issues, including missing domain sections for supported templates.

## Final pass

Before finishing:

1. Check that the notebook path and file name match the task.
2. Confirm the notebook structure is complete and coherent.
3. Run the quality check script if possible.
4. Mention any assumptions about missing data, packages, or execution limits.
