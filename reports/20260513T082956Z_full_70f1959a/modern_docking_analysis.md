# Modern docking analysis annex

Run ID: `20260513T082956Z_full_70f1959a`

This annex extends the main repurposing report with docking-focused visual analysis using the completed uncapped approved-source screen.

## Methodology

### Description

- Ligand set: deduplicated approved-source union from ChEMBL and DrugCentral.
- Targets: `9P3Y` and `5E04`.
- Visual analytics: receptor-level score distributions, top-hit docking heatmap, composite score decomposition, Pareto-style docking / ADMET / QSAR scatter, and receptor comparison of top-ranked ligands.

### Analysis notes

Docking scores are interpreted as relative computational priorities only. More negative scores indicate stronger predicted binding in this workflow, but they are not experimental affinities.

## Results

### Run summary

| Metric | Value |
| --- | --- |
| Unique ligands | 3460 |
| Docking rows | 1671 |
| Ranking rows | 934 |
| Top hits | 93 |
| Rejected preprocessing ligands | 2526 |
| Figures | 5 |

### Best receptor-wise candidates

| Receptor | Best ligand | Binding site | Best score (kcal/mol) |
| --- | --- | --- | --- |
| 9P3Y | GRANISETRON_chembl289469 | site_1 | -6.523 |
| 5E04 | PAROXETINE_chembl490 | site_1 | -8.730 |

### Top 10 prioritized ligands

| Rank | Ligand | Composite score | Priority | Best receptor | Best site | Best docking score (kcal/mol) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | PAROXETINE_chembl490 | 0.881 | high | 5E04 | site_1 | -8.730 |
| 2 | MINAPRINE_chembl278819 | 0.789 | high | 5E04 | site_1 | -7.900 |
| 3 | dolasetron_dc3931 | 0.776 | high | 5E04 | site_1 | -7.811 |
| 4 | LEFLUNOMIDE_chembl960 | 0.760 | high | 5E04 | site_1 | -7.791 |
| 5 | NATEGLINIDE_chembl783 | 0.746 | medium | 5E04 | site_1 | -7.524 |
| 6 | DAPIPRAZOLE_chembl1201216 | 0.746 | medium | 5E04 | site_1 | -7.557 |
| 7 | AGOMELATINE_chembl10878 | 0.742 | medium | 5E04 | site_1 | -7.547 |
| 8 | INDOPROFEN_chembl15870 | 0.737 | medium | 5E04 | site_1 | -7.543 |
| 9 | CINOXACIN_chembl1208 | 0.730 | medium | 5E04 | site_1 | -7.482 |
| 10 | INDAPAMIDE_chembl406 | 0.715 | medium | 5E04 | site_1 | -7.351 |

### Modern docking figures

#### Docking score distribution by receptor

![Docking score distribution by receptor](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/modern_docking_figures/01_docking_score_violin_by_receptor.png)

#### Top ligands receptor heatmap

![Top ligands receptor heatmap](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/modern_docking_figures/02_top_hits_receptor_heatmap.png)

#### Top 10 composite score decomposition

![Top 10 composite score decomposition](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/modern_docking_figures/03_top10_composite_breakdown.png)

#### Pareto docking / ADMET / QSAR view

![Pareto docking / ADMET / QSAR view](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/modern_docking_figures/04_pareto_docking_admet_qsar.png)

#### Top 15 receptor comparison

![Top 15 receptor comparison](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/modern_docking_figures/05_receptor_comparison_top15.png)

### Interpretation

The visual analysis indicates a receptor-skewed ranking profile in which the strongest candidates in this run predominantly favor 5E04, while 9P3Y shows a narrower and weaker score range. The Pareto-style view shows that the top compounds balance docking, QSAR, and ADMET differently, which is useful for manual triage before any experimental planning.

## Limitations

- No wet-lab validation is provided.
- QSAR and ADMET components remain heuristic in this run.
- PLIP / ProLIF were unavailable, so detailed interaction fingerprints were not generated.
- Docking scores are comparative estimates, not measured binding free energies.

## Next steps

1. Inspect the pose files for the top 10 ligands in ChimeraX or PyMOL and confirm that the docked orientations, contacts, and ring placements are chemically plausible.
2. Install PLIP or ProLIF on the remote host and rerun the interaction analysis so hydrogen bonds, hydrophobic contacts, and aromatic interactions are reported instead of the geometric fallback.
3. Run a secondary rescoring pass on the top-ranked ligands using a consensus method such as an additional docking engine or MM/GBSA-style post-processing, while keeping the interpretation strictly computational.
4. Re-dock the top candidates against alternative pocket definitions or ensemble receptor conformations to test whether the ranking is stable to binding-site uncertainty.
5. Expand the repurposing source set beyond ChEMBL and DrugCentral if broader approved-source coverage is needed, then rerun the same pipeline to compare rank stability.
6. Archive the current run bundle as the reference screening result so future runs can be compared against this baseline rather than mixing outputs across parameter sets.
