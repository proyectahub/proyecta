# Andes orthohantavirus in silico prioritization report

Run 20260513T074010Z_dry-run_d8a26cf1 | Mode: dry-run | Status: completed


## Project Summary

- **Run ID**: 20260513T074010Z_dry-run_d8a26cf1
- **Config hash**: d8a26cf16b7f9d22da865ea019050de5e72da51a789629b20dcb74aa6c13f0cf
- **Timestamp**: 20260513T074010Z
- **Python**: 3.10.11
- **OS**: Windows
- **Validation warnings**: 0
- **Validation errors**: 0
- **Blockers**: 0

## Methods

- **Seed**: 42
- **CPU workers**: 2
- **QSAR top fraction**: 0.100
- **Docking exhaustiveness**: 8
- **Docking poses**: 9
- **Docking receptors**: 9P3Y, 5E04

## Software Versions

- **Bio**: NA
- **joblib**: 1.5.3
- **matplotlib**: 3.10.8
- **numpy**: 1.26.4
- **pandas**: 2.3.3
- **rdkit**: NA
- **requests**: 2.31.0
- **scipy**: 1.15.3
- **sklearn**: NA
- **yaml**: NA

## Receptor Information

| receptor_id | status | chains | selected_chains | prepared_pdb | prepared_pdbqt | warnings |
| --- | --- | --- | --- | --- | --- | --- |
| 9P3Y | prepared_no_pdbqt | I, J, K, L, M, N, O, P, A, B, C, D, E, F, G, H, Q, R, S, T, U, V, W, X | A | I:\MDATOS2.0\receptors\prepared\20260513T074010Z_dry-run_d8a26cf1\9P3Y\9P3Y_prepared.pdb | NA | Detected 1524 missing residue annotations in the raw structure., Raw structure contains 1 hetero-residue entries befo... |
| 5E04 | prepared_no_pdbqt | A, B | A | I:\MDATOS2.0\receptors\prepared\20260513T074010Z_dry-run_d8a26cf1\5E04\5E04_prepared.pdb | NA | Detected 22 missing residue annotations in the raw structure., Receptor PDBQT conversion was not completed. |

## Ligand Library Summary

- **Accepted ligands**: 0
- **Rejected ligands**: 0
- **Input ligands**: 0
- **QSAR selected**: 0
- **ADMET predictions**: 0
- **Docking rows**: 0
- **Top hits**: 0

## Ligand Filtering Statistics

_No data available._

## QSAR / AI Filtering Summary

_No data available._

## Docking Parameters

| exhaustiveness | num_poses | energy_range | retry_failed_jobs | workers | vina_executable |
| --- | --- | --- | --- | --- | --- |
| 8 | 9 | 3 | 1 | 2 | vina |

## Docking Boxes

| receptor_id | binding_site_id | enabled | center | size |
| --- | --- | --- | --- | --- |
| 9P3Y | site_1 | True | 148.302, 138.954, 161.363 | 23.623, 24.344, 28.995 |
| 5E04 | site_1 | True | -32.715, -15.712, 45.022 | 33.721, 43.327, 40.402 |

## Docking Results

No docking results were generated in this run.

## Interaction Analysis

No interaction annotations were produced. Install PLIP or ProLIF for richer contact analysis, or ensure docking poses are available.

## ADMET Summary

_No data available._

## Final Ranked Candidates

_No data available._

## Limitations

- This pipeline performs in silico prioritization only and does not establish biological activity, antiviral efficacy, safety, or clinical utility.
- Docking boxes must be user-specified or derived from external pocket analysis; placeholders are not a substitute for a defined binding site.
- QSAR, ADMET, and interaction annotations are heuristic or model-dependent and require experimental validation.
- No wet-lab protocols, pathogen culture methods, or pathogen engineering instructions are provided.

## Recommended Next Steps

- Define or validate the binding-site coordinates for 9P3Y and 5E04 before any full docking campaign.
- Provide a curated ligand library with clear provenance and, if available, a local QSAR model with metadata.
- Install Open Babel or AutoDockTools/MGLTools to enable PDBQT conversion if not already available.
- Review top-ranked computational candidates before any experimental follow-up.
