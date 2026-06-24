# Andes orthohantavirus in silico prioritization report

Run 20260513T065929Z_test_d34af69b | Mode: test | Status: partial


## Project Summary

- **Run ID**: 20260513T065929Z_test_d34af69b
- **Config hash**: d34af69b6aeaf4b7c88aaf86ed0b770c3a3d6c413933f41f89a305d13edc4c59
- **Timestamp**: 20260513T065929Z
- **Python**: 3.10.11
- **OS**: Windows
- **Validation warnings**: 2
- **Validation errors**: 0
- **Blockers**: 8

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
| 9P3Y | prepared_no_pdbqt | I, J, K, L, M, N, O, P, A, B, C, D, E, F, G, H, Q, R, S, T, U, V, W, X | A | I:\MDATOS2.0\receptors\prepared\20260513T065929Z_test_d34af69b\9P3Y\9P3Y_prepared.pdb | NA | Detected 1524 missing residue annotations in the raw structure., Raw structure contains 1 hetero-residue entries befo... |
| 5E04 | prepared_no_pdbqt | A, B | A | I:\MDATOS2.0\receptors\prepared\20260513T065929Z_test_d34af69b\5E04\5E04_prepared.pdb | NA | Detected 22 missing residue annotations in the raw structure., Receptor PDBQT conversion was not completed. |

## Ligand Library Summary

- **Accepted ligands**: 3
- **Rejected ligands**: 2
- **Input ligands**: 5
- **QSAR selected**: 1
- **ADMET predictions**: 3
- **Docking rows**: 0
- **Top hits**: 1

## Ligand Filtering Statistics

| total_input | accepted | rejected | lipinski_rejected | veber_rejected | duplicate_rejected | alerts_rejected | 3d_failed | docking_ready | pdbqt_ready |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 3 | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |

## QSAR / AI Filtering Summary

| total_count | selected_count | model_used | mode | qsar_score_min | qsar_score_max | qsar_score_mean | reference_smiles_count |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 1 | heuristic_baseline | heuristic | 0.564 | 0.783 | 0.651 | 0 |

## Docking Parameters

| exhaustiveness | num_poses | energy_range | retry_failed_jobs | workers | vina_executable |
| --- | --- | --- | --- | --- | --- |
| 8 | 9 | 3 | 1 | 2 | vina |

## Docking Boxes

| receptor_id | binding_site_id | enabled | center | size |
| --- | --- | --- | --- | --- |
| 9P3Y | site_1 | True | None, None, None | None, None, None |
| 5E04 | site_1 | True | None, None, None | None, None, None |

## Docking Results

No docking results were generated in this run.

## Interaction Analysis

No interaction annotations were produced. Install PLIP or ProLIF for richer contact analysis, or ensure docking poses are available.

## ADMET Summary

| total_count | admet_score_min | admet_score_max | admet_score_mean | oral_likeness_count | high_confidence_count |
| --- | --- | --- | --- | --- | --- |
| 3.000 | 0.673 | 0.820 | 0.754 | 3.000 | 3.000 |

## Final Ranked Candidates

| rank_position | ligand_id | composite_score | priority_label | best_receptor_id | best_binding_site_id | best_docking_score_kcal_mol |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | ibuprofen | 0.620 | medium | NA | NA | NA |

## Composite Ranking

| rank_position | ligand_id | composite_score | priority_label | docking_component | qsar_component | admet_component | multi_target_component |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ibuprofen | 0.620 | medium | 0.500 | 0.783 | 0.820 | 0.000 |
| 2 | nicotinamide | 0.561 | medium | 0.500 | 0.564 | 0.768 | 0.000 |
| 3 | caffeine | 0.552 | medium | 0.500 | 0.606 | 0.673 | 0.000 |

## Rejected Candidates

### Ranked-out candidates

| ligand_id | composite_score | rejection_reason | selection_status |
| --- | --- | --- | --- |
| nicotinamide | 0.561 | below_top_rank_threshold | not_prioritized |
| caffeine | 0.552 | below_top_rank_threshold | not_prioritized |
| aspirin | NA | BRENK:phenol_ester | preprocessing_rejected |
| acetaminophen | NA | BRENK:hydroquinone | preprocessing_rejected |

### Preprocessing rejects

| ligand_id | smiles | reason |
| --- | --- | --- |
| aspirin | CC(=O)Oc1ccccc1C(=O)O | BRENK:phenol_ester |
| acetaminophen | CC(=O)Nc1ccc(O)cc1 | BRENK:hydroquinone |

## Figures

![Molecular Weight Distribution](plots/molecular_weight_distribution.png)

*Molecular Weight Distribution*

![Logp Distribution](plots/logp_distribution.png)

*Logp Distribution*

![Tpsa Distribution](plots/tpsa_distribution.png)

*Tpsa Distribution*

![Top Hit Score Comparison](plots/top_hit_score_comparison.png)

*Top Hit Score Comparison*

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

## Pipeline Blockers

- AutoDock Vina is not available in PATH. Install Vina and ensure the executable can be resolved before docking.
- No ligand PDBQT files are available. Install Open Babel or AutoDockTools to prepare docking-ready ligands.
- Receptor 9P3Y does not have a prepared PDBQT file. Install Open Babel or AutoDockTools to enable receptor conversion.
- Docking box center is undefined for binding site site_1.
- Docking box size is undefined for binding site site_1.
- Receptor 5E04 does not have a prepared PDBQT file. Install Open Babel or AutoDockTools to enable receptor conversion.
- Docking box center is undefined for binding site site_1.
- Docking box size is undefined for binding site site_1.

## Validation Warnings

- Docking box undefined for 9P3Y/site_1. Define center and size in config.yaml.
- Docking box undefined for 5E04/site_1. Define center and size in config.yaml.
