# Andes orthohantavirus in silico prioritization report

Run 20260513T065940Z_full_d34af69b | Mode: full | Status: partial


## Project Summary

- **Run ID**: 20260513T065940Z_full_d34af69b
- **Config hash**: d34af69b6aeaf4b7c88aaf86ed0b770c3a3d6c413933f41f89a305d13edc4c59
- **Timestamp**: 20260513T065940Z
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
| 9P3Y | reloaded | A | A | I:\MDATOS2.0\receptors\prepared\9P3Y_prepared.pdb | I:\MDATOS2.0\receptors\prepared\9P3Y_prepared.pdbqt | NA |
| 5E04 | reloaded | A | A | I:\MDATOS2.0\receptors\prepared\5E04_prepared.pdb | I:\MDATOS2.0\receptors\prepared\5E04_prepared.pdbqt | NA |

## Ligand Library Summary

- **Accepted ligands**: 0
- **Rejected ligands**: 0
- **Input ligands**: 0
- **QSAR selected**: 1
- **ADMET predictions**: 3
- **Docking rows**: 0
- **Top hits**: 1

## Ligand Filtering Statistics

| accepted | rejected | total_input |
| --- | --- | --- |
| 0 | 0 | 0 |

## QSAR / AI Filtering Summary

| mode | model_used | qsar_score_max | qsar_score_mean | qsar_score_min | reference_smiles_count | selected_count | total_count |
| --- | --- | --- | --- | --- | --- | --- | --- |
| heuristic | heuristic_baseline | 0.783 | 0.651 | 0.564 | 0 | 1 | 3 |

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

| admet_score_max | admet_score_mean | admet_score_min | high_confidence_count | oral_likeness_count | total_count |
| --- | --- | --- | --- | --- | --- |
| 0.820 | 0.754 | 0.673 | 3.000 | 3.000 | 3.000 |

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

## Figures

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
