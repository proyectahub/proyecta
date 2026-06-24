# Candidate-Control Vina Score Comparison for MD Follow-up

Run bundle: `20260513T082956Z_full_70f1959a`

## Scope

This analysis compares the receptor-specific docking scores of the selected MD candidates against computational antiviral controls and a 9P3Y structural redocking control. The values are AutoDock Vina scores in kcal/mol and are used only as computational prioritization metrics. They are not experimental binding affinities and do not establish antiviral activity.

## Methods

The comparison combines: (i) receptor-specific best Vina scores from the original approved-source repurposing screen for `PAROXETINE_chembl490` and `GRANISETRON_chembl289469`; (ii) additional Vina docking of `RIBAVIRIN_control`, `FAVIPIRAVIR_control`, and `REMDESIVIR_control` into the same configured pockets of `5E04` and `9P3Y`; and (iii) a 9P3Y NAG redocking control generated from the crystallographic NAG residue nearest the configured 9P3Y site center. Lower/more negative scores are interpreted as more favorable under the Vina scoring function, but the comparison is scoring-function dependent.

## Results

### Consolidated Vina Table

| receptor_id | ligand_id | comparison_class | vina_score_kcal_mol | within_receptor_rank | source |
| --- | --- | --- | --- | --- | --- |
| 5E04 | PAROXETINE_chembl490 | Top 5E04 candidate | -8.730 | 1 | Original repurposing Vina screen |
| 5E04 | REMDESIVIR_control | Antiviral computational reference | -7.395 | 2 | Additional control docking/redocking |
| 5E04 | GRANISETRON_chembl289469 | Top 9P3Y candidate | -6.826 | 3 | Original repurposing Vina screen |
| 5E04 | RIBAVIRIN_control | Antiviral computational reference | -6.181 | 4 | Additional control docking/redocking |
| 5E04 | FAVIPIRAVIR_control | Antiviral computational reference | -6.171 | 5 | Additional control docking/redocking |
| 9P3Y | REMDESIVIR_control | Antiviral computational reference | -6.605 | 1 | Additional control docking/redocking |
| 9P3Y | GRANISETRON_chembl289469 | Top 9P3Y candidate | -6.523 | 2 | Original repurposing Vina screen |
| 9P3Y | PAROXETINE_chembl490 | Top 5E04 candidate | -6.001 | 3 | Original repurposing Vina screen |
| 9P3Y | RIBAVIRIN_control | Antiviral computational reference | -5.281 | 4 | Additional control docking/redocking |
| 9P3Y | NAG_crystallographic_redock | 9P3Y structural redocking control | -4.470 | 5 | Additional control docking/redocking |
| 9P3Y | FAVIPIRAVIR_control | Antiviral computational reference | -4.274 | 6 | Additional control docking/redocking |

### Candidate vs Best Control Summary

| receptor_id | best_candidate | best_candidate_score | best_control | best_control_score | candidate_minus_control_kcal_mol | interpretation |
| --- | --- | --- | --- | --- | --- | --- |
| 5E04 | PAROXETINE_chembl490 | -8.730 | REMDESIVIR_control | -7.395 | -1.335 | candidate more favorable than best control in this comparison set |
| 9P3Y | GRANISETRON_chembl289469 | -6.523 | REMDESIVIR_control | -6.605 | 0.082 | best control equal/more favorable than candidate in this comparison set |

## Figures

### Vina score matrix

![Vina score heatmap](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/md_control_comparison/vina_score_heatmap_candidates_controls.png)

### Per-receptor ranking/lollipop plot

![Vina lollipop plot](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/md_control_comparison/vina_lollipop_by_receptor.png)

### Target-ligand relationship map

![Target ligand network](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/md_control_comparison/target_ligand_vina_network.png)

### Candidate-control score delta

![Candidate-control delta](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/md_control_comparison/candidate_vs_best_control_delta.png)

### Score spread

![Vina score spread](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/md_control_comparison/vina_score_spread_candidates_controls.png)

## Technical Interpretation

For `5E04`, `PAROXETINE_chembl490` retained the most favorable score in this comparison set (`-8.730 kcal/mol`), exceeding the best additional antiviral control, `REMDESIVIR_control` (`-7.395 kcal/mol`), by `-1.335 kcal/mol`. This supports retaining the paroxetine-nucleoprotein complex as the primary 5E04 MD candidate, while remdesivir provides a useful computational reference for trajectory comparison.

For `9P3Y`, `REMDESIVIR_control` (`-6.605 kcal/mol`) scored slightly more favorably than the selected repurposing candidate `GRANISETRON_chembl289469` (`-6.523 kcal/mol`) by `0.082 kcal/mol`. This difference is within the practical uncertainty expected for single-score docking and should not be overinterpreted. The NAG redocking control scored less favorably (`-4.470 kcal/mol`), but it remains important as a structural/glycan-fragment comparator for the exploratory NAG-associated pocket.

## Publication Wording

Docking-score comparisons were used to contextualize the MD systems against computational reference ligands. The nucleoprotein target (`5E04`) showed the strongest score for the selected repurposing candidate paroxetine within the analyzed candidate-control panel. In contrast, the glycoprotein-associated exploratory pocket (`9P3Y`) showed comparable Vina scores for granisetron and remdesivir, while the crystallographic NAG redocking control provided a structurally motivated glycan-fragment reference. These findings support MD-based pose-stability evaluation but do not constitute evidence of antiviral efficacy, direct target engagement, or experimental binding.

## Output Files

- `candidate_control_vina_comparison.csv`
- `candidate_control_vina_matrix.csv`
- `candidate_vs_control_summary.csv`
- `vina_score_heatmap_candidates_controls.png`
- `vina_lollipop_by_receptor.png`
- `target_ligand_vina_network.png`
- `candidate_vs_best_control_delta.png`
- `vina_score_spread_candidates_controls.png`
