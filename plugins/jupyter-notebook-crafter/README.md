# Bioinformatics Notebook Crafter

`jupyter-notebook-crafter` is a local Codex plugin for creating complete, polished, and runnable bioinformatics Jupyter notebooks with special emphasis on docking and molecular dynamics workflows in Python.

## Included pieces

- A plugin manifest in `.codex-plugin/plugin.json`
- A dedicated skill in `skills/jupyter-notebook-crafter/SKILL.md`
- A starter notebook generator in `scripts/new_notebook.py`
- A lightweight notebook validator in `scripts/notebook_quality_check.py`
- Built-in notebook templates for `docking`, `molecular-dynamics`, and `generic`

## Quick examples

Create a docking notebook:

```powershell
python .\plugins\jupyter-notebook-crafter\scripts\new_notebook.py .\notebooks\docking-analysis.ipynb --template docking --title "Docking Analysis" --summary "Analyze docking scores and poses for candidate ligands."
```

Create a molecular dynamics notebook:

```powershell
python .\plugins\jupyter-notebook-crafter\scripts\new_notebook.py .\notebooks\md-analysis.ipynb --template molecular-dynamics --title "Molecular Dynamics Analysis" --summary "Inspect trajectory stability, flexibility, and binding-site contacts."
```

Validate a notebook:

```powershell
python .\plugins\jupyter-notebook-crafter\scripts\notebook_quality_check.py .\notebooks\eda.ipynb
```

## Next customization points

- Replace example author and website metadata in the plugin manifest.
- Add project-specific conventions for your docking engine, file layout, and MD stack.
- Expand the validation script with checks for required columns, trajectory names, or package availability if needed.
