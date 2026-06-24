# IMRD report: Andes orthohantavirus / Hantavirus repurposing screen

Run ID: `20260513T082956Z_full_70f1959a`  
Mode: `full`  
Status: `completed`

## Introduction

This report summarizes a fully computational, repurposing-oriented virtual screening campaign against two Andes orthohantavirus targets: PDB `9P3Y` (glycoprotein complex / Gn-Gc-related structure) and PDB `5E04` (nucleoprotein). The objective was not to claim antiviral activity, but to prioritize approved public-source compounds for follow-up based on ligand preprocessing, heuristic QSAR/ADMET scoring, molecular docking with AutoDock Vina, and composite ranking.

The screened chemical universe was intentionally restricted to approved or clinical-stage repurposing sources. That choice makes the workflow more conservative and more relevant to hypothesis generation for known molecules, but it also means the ranking reflects a trade-off between target fit, physicochemical tractability, and library provenance rather than novel chemical space exploration.

## Methods

### Data assembly and reproducibility

- Approved-source ligands were merged from ChEMBL and DrugCentral, then deduplicated by InChIKey.
- The run used a fixed random seed (`42`) and timestamped output directories to avoid silent overwrites.
- Configuration, environment metadata, and command-line provenance were recorded in the run bundle.

### Receptor preparation

- `9P3Y` and `5E04` were downloaded or loaded locally, validated, cleaned, and converted to docking-ready receptor files.
- Waters were removed by default; chain `A` was selected for docking in both targets.
- Docking boxes were explicitly defined in the configuration and were not inferred inside the pipeline.

### Ligand preprocessing and filtering

- Ligands were standardized, salted/fragments removed when appropriate, neutralized where possible, and deduplicated.
- Molecular descriptors included MW, cLogP, TPSA, HBD, HBA, rotatable bonds, formal charge, fraction Csp3, aromatic rings, and QED.
- Drug-likeness filters used Lipinski, Veber, and PAINS/BRENK alert catalogues.
- Each rejected ligand was logged with a rejection reason.

### QSAR / ADMET / ranking

- No local supervised QSAR model was supplied, so the screen used a transparent heuristic baseline rather than a validated predictive model.
- ADMET scoring was likewise conservative and mostly rule-based / proxy-based.
- The composite score combined docking, QSAR, ADMET, drug-likeness, toxicity, and multi-target behavior with configurable weights.

### Docking and visualization

- AutoDock Vina was used with `exhaustiveness=8`, `num_poses=9`, and a two-target, one-site-per-target configuration.
- The original archived run did not retain residue-level interaction fingerprints; interaction annotation fell back to geometry-based heuristics in the original bundle.
- The report includes both the standard statistical plots and a docking-focused modern figure annex to support manual inspection.

## Results

### Run summary

| Metric | Value |
| --- | --- |
| Raw fetched ligands (ChEMBL + DrugCentral) | 4986 |
| Unique deduplicated ligands | 3460 |
| Accepted after preprocessing | 934 |
| Rejected during preprocessing | 2526 |
| Selected for docking | 93 |
| Docking pose rows | 1671 |
| Ranking rows | 934 |
| Top hits retained | 93 |

Interpretation: the pipeline is intentionally stringent. Roughly three quarters of the unique repurposing library were filtered out before docking, and only the top 10% of the accepted set advanced to Vina. That behavior is consistent with a repurposing workflow that prioritizes tractable, drug-like molecules over exhaustive chemical diversity.

### Library assembly and filtering

| Library stage | Count / note |
| --- | --- |
| ChEMBL approved/clinical fetched | 3127 |
| DrugCentral approved fetched | 1859 |
| Raw fetched total | 4986 |
| Deduplicated unique ligands | 3460 |
| Unique reduction | 1526 (30.6%) |

| Filtering metric | Value |
| --- | --- |
| Input unique ligands | 3460 |
| Accepted after preprocessing | 934 |
| Rejected during preprocessing | 2526 |
| Accepted fraction | 27.0% |
| Selected for docking | 93 |
| Selected fraction of accepted | 10.0% |
| Docking pose rows | 1671 |
| Ranking rows | 934 |

Analytically, the merged source set collapsed from 4,986 fetched records to 3,460 unique ligands, a 30.6% reduction from deduplication alone. The accepted set (934 ligands) still represents a chemically usable repurposing subset, but the attrition profile shows that redundancy and explicit structural alerts were major bottlenecks. This is desirable in a conservative repurposing screen because it removes repeated or obviously problematic scaffolds before the computational cost of docking is paid.

### Docking performance by receptor

| Receptor | Pose rows | Mean score | Median score | Best score | Worst score | Best ligand | Best-ligand score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5E04 | 835 | -6.060 | -6.048 | -8.730 | -4.493 | PAROXETINE_chembl490 | -8.730 |
| 9P3Y | 836 | -5.158 | -5.181 | -6.523 | -3.912 | GRANISETRON_chembl289469 | -6.523 |

This is the clearest receptor-level signal in the screen. `5E04` is consistently shifted toward more favorable docking scores than `9P3Y`: the mean Vina score is approximately 0.90 kcal/mol more negative, the median is similarly shifted, and the best ligand for `5E04` (`PAROXETINE_chembl490`) reaches -8.730 kcal/mol, whereas the best `9P3Y` ligand (`GRANISETRON_chembl289469`, from the ranking bundle) is notably weaker at the top end. The implication is not that `5E04` is biologically validated as the better target, but that the current binding-site definition and chemical library are more complementary to that receptor pocket in silico.

### Top 10 computationally prioritized candidates

| Rank | Ligand | Best receptor | Site | Best docking | Composite | MW | cLogP | TPSA | QED |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | PAROXETINE_chembl490 | 5E04 | site_1 | -8.730 | 0.881 | 329.371 | 3.327 | 39.720 | 0.934 |
| 2 | MINAPRINE_chembl278819 | 5E04 | site_1 | -7.900 | 0.789 | 298.390 | 2.196 | 50.280 | 0.917 |
| 3 | dolasetron_dc3931 | 5E04 | site_1 | -7.811 | 0.776 | 324.380 | 2.519 | 62.400 | 0.862 |
| 4 | LEFLUNOMIDE_chembl960 | 5E04 | site_1 | -7.791 | 0.760 | 270.210 | 3.254 | 55.130 | 0.911 |
| 5 | NATEGLINIDE_chembl783 | 5E04 | site_1 | -7.524 | 0.746 | 317.429 | 3.261 | 66.400 | 0.846 |
| 6 | DAPIPRAZOLE_chembl1201216 | 5E04 | site_1 | -7.557 | 0.746 | 325.460 | 2.288 | 37.190 | 0.864 |
| 7 | AGOMELATINE_chembl10878 | 5E04 | site_1 | -7.547 | 0.742 | 243.306 | 2.527 | 38.330 | 0.896 |
| 8 | INDOPROFEN_chembl15870 | 5E04 | site_1 | -7.543 | 0.737 | 281.311 | 3.035 | 57.610 | 0.940 |
| 9 | CINOXACIN_chembl1208 | 5E04 | site_1 | -7.482 | 0.730 | 262.221 | 0.843 | 90.650 | 0.862 |
| 10 | INDAPAMIDE_chembl406 | 5E04 | site_1 | -7.351 | 0.715 | 365.842 | 2.083 | 92.500 | 0.871 |

The top 10 compounds are all directed to `5E04`, which is a strong indicator that the composite score is not merely reflecting QSAR/ADMET neutrality but is genuinely being driven by the docking term for this screen. The top ligands are also all within a relatively compact drug-like envelope: MW 243?366, cLogP 0.84?3.33, TPSA 37?92 ??, and QED 0.846?0.940. In other words, the screen favored moderately lipophilic, synthetically accessible, orally plausible scaffolds rather than extreme chemotypes.

### Drug-likeness envelope of the top 10

| Property | Observed range / note |
| --- | --- |
| Molecular weight | 243.3?365.8 |
| cLogP | 0.843?3.327 |
| TPSA (??) | 37.19?92.50 |
| HBD | 0?2 |
| HBA | 2?6 |
| Rotatable bonds | 2?6 |
| QED | 0.846?0.940 |

### Rejection profile

#### Preprocessing rejects

| Reason | Count |
| --- | --- |
| duplicate_inchikey | 1072 |
| lipinski_failed | 667 |
| veber_failed | 114 |
| BRENK:Aliphatic_long_chain | 57 |
| BRENK:isolated_alkene | 38 |
| BRENK:aniline | 36 |
| BRENK:quaternary_nitrogen_2 | 29 |
| BRENK:alkyl_halide | 26 |
| BRENK:nitro_group; BRENK:Oxygen-nitrogen_single_bond | 22 |
| BRENK:triple_bond | 20 |
| PAINS:catechol_A(92); BRENK:catechol | 19 |
| BRENK:Michael_acceptor_1 | 18 |

#### Ranked-out candidates

| Reason | Count |
| --- | --- |
| below_top_rank_threshold | 841 |

The preprocessing rejection pattern is informative. Duplicate InChIKeys dominate, meaning the approved-source union contains substantial overlap across databases and internal records. Lipinski and Veber failures are the second major class, showing that a meaningful fraction of approved or clinical molecules are still too large, too flexible, or too polar for a simple oral-like docking screen. The alert-based rejections capture chemically plausible but undesirable motifs such as long aliphatic chains, isolated alkenes, anilines, nitro motifs, and catechol-like alerts. By contrast, all 841 ranked-out candidates were excluded only by the top-fraction threshold, not by chemical quality, so those molecules remain computationally acceptable but lower priority within this run.

### Figures

#### Core physicochemical and ranking plots

![Docking score distribution](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/plots/docking_score_distribution.png)
*Docking score distribution*

![Molecular weight distribution](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/plots/molecular_weight_distribution.png)
*Molecular weight distribution*

![LogP distribution](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/plots/logp_distribution.png)
*LogP distribution*

![TPSA distribution](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/plots/tpsa_distribution.png)
*TPSA distribution*

![QSAR vs docking scatter](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/plots/qsar_vs_docking_scatter.png)
*QSAR vs docking scatter*

![Top hit score comparison](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/plots/top_hit_score_comparison.png)
*Top hit score comparison*

![Receptor-wise score comparison](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/plots/receptor_wise_score_comparison.png)
*Receptor-wise score comparison*

#### Modern docking annex

![Docking score violin by receptor](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/modern_docking_figures/01_docking_score_violin_by_receptor.png)
*Docking score violin by receptor*

![Top ligands receptor heatmap](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/modern_docking_figures/02_top_hits_receptor_heatmap.png)
*Top ligands receptor heatmap*

![Top 10 composite score breakdown](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/modern_docking_figures/03_top10_composite_breakdown.png)
*Top 10 composite score breakdown*

![Pareto docking / ADMET / QSAR](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/modern_docking_figures/04_pareto_docking_admet_qsar.png)
*Pareto docking / ADMET / QSAR*

![Top 15 receptor comparison](I:/MDATOS2.0/reports/20260513T082956Z_full_70f1959a/modern_docking_figures/05_receptor_comparison_top15.png)
*Top 15 receptor comparison*

These figures should be read together, not in isolation. The violin and receptor comparison plots show the receptor-level separation; the heatmap shows that the top compounds consistently favor `5E04`; the composite breakdown shows that docking dominates the top ranks but is tempered by QSAR and ADMET; and the Pareto plot shows that the leading candidates occupy a comparatively favorable corner of the three-dimensional decision space rather than winning on a single metric alone.

### Interaction analysis status

| Field | Value |
| --- | --- |
| Archived interaction backend | geometric_fallback |
| Interaction records preserved in the bundle | 0 |
| Consequence | No residue-level contact table is available in the archived run bundle; richer annotations require a ProLIF/PLIP rerun. |

## Discussion

The main analytical result is the asymmetry between the two pockets: the `5E04` site consistently produces deeper and more coherent docking scores than `9P3Y` across the approved-source repurposing set. That pattern is reinforced in the ranked list, where all of the top 10 candidates are `5E04`-favored. In practical terms, this means the current pocket definition for `5E04` is either better matched to the approved-drug chemical space or simply less restrictive than the `9P3Y` box. Because the screen is computational, that observation is hypothesis-generating only; it should not be read as evidence of antiviral activity.

The hit list is also chemically coherent. The best-ranked ligands are not random high-score outliers with poor drug-likeness; rather, they cluster around moderate MW, moderate cLogP, manageable TPSA, and high QED. That is a favorable sign because it suggests the docking and heuristic filters are converging on molecules that are at least plausible repurposing candidates. However, the heuristic QSAR/ADMET layer is still a coarse prioritization device, not a validated activity model. Its role here is to reduce obvious liabilities and stabilize the ranking, not to claim efficacy or safety.

The screening pipeline is also intentionally conservative in a way that matters for repurposing: structural duplicates and alert-bearing scaffolds are removed before docking, which prevents the top ranks from being inflated by database redundancy or chemically noisy motifs. The cost of that conservatism is that many approved-source molecules never reach docking, but the benefit is a cleaner candidate list with less false optimism.

The main missing piece in the archived bundle is rich interaction annotation. The current report bundle retains only a geometric fallback and no residue-level protein-ligand interaction fingerprints. That limits mechanistic interpretation of the pose geometry. The codebase now contains a ProLIF-capable rerun path, so the next rational step is to rerun interaction analysis on the completed bundle once the host environment is reachable and `prolif` / `MDAnalysis` are installed.

## Limitations and next steps

- Docking scores are relative computational scores, not binding free energies.
- QSAR and ADMET estimates are heuristic in this archived run.
- Interaction fingerprints were not available in the original bundle.
- Binding-site coordinates remain configuration-dependent and should be revisited if alternative pocket definitions are available.

Recommended next steps: inspect the top pose files in a molecular viewer, rerun interaction analysis with ProLIF or PLIP, optionally perform consensus rescoring, and test pocket-definition sensitivity with alternate receptor conformations.

