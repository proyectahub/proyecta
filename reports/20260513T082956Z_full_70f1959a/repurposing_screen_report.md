# Andes orthohantavirus repurposing virtual screening report

Run ID: `20260513T082956Z_full_70f1959a`

This report summarizes a computation-only repurposing screen against Andes orthohantavirus targets `9P3Y` and `5E04`.
All outputs are hypothesis-generating only and require experimental validation.

## Description

- Target 1: `9P3Y` Andes virus glycoprotein complex / Gn-Gc glycoprotein-related structure.
- Target 2: `5E04` Andes virus nucleoprotein.
- Ligands: approved-source repurposing union from ChEMBL and DrugCentral, deduplicated by chemical identity.
- Screening objective: computational prioritization of candidate ligands for follow-up, not antiviral efficacy claims.

## Methodology

### 1. Ligand library assembly

Approved and clinically relevant public compounds were merged from ChEMBL and DrugCentral, canonicalized, and deduplicated by InChIKey. The merged set was capped only by duplicate removal in this uncapped run.

| Source | Fetched records | Source reference |
| --- | --- | --- |
| ChEMBL | 3127 | https://www.ebi.ac.uk/chembl/api/data/molecule.json |
| DrugCentral | 1859 | https://drugcentral.org/static/FDA_Approved.csv |

### 2. Receptor handling

Both receptors were prepared from the configured structures, waters were removed by default, chain selection was applied, and PDBQT conversion was attempted with available external tooling. The configured docking boxes were defined in `configs/config_repurposing.yaml` before the run, so screening could proceed.

### 3. Ligand preprocessing and 3D preparation

Ligands were standardized when possible, salts/fragments were handled conservatively, invalid records were removed, 3D conformers were generated, and structures were minimized before docking. Rejected ligands were logged with reasons.

### 4. QSAR / heuristic prioritization

No local pre-trained QSAR model was configured, so the pipeline used a transparent heuristic scoring mode based on molecular properties and drug-likeness features. These scores are not evidence of activity.

### 5. Docking

AutoDock Vina was used for the configured receptor sites. The screen ran with the remote Ubuntu host and produced pose files plus Vina logs for each successful ligand-receptor job.

### 6. Interaction analysis and ADMET

PLIP and ProLIF were not available on the remote host, so the pipeline fell back to a geometric placeholder interaction analysis. ADMET outputs were conservative rule-based / heuristic estimates only.

### 7. Composite ranking

Final ranking combined docking, QSAR, ADMET, drug-likeness, toxicity, and multi-target behavior using configurable weights.

## Results

### Run summary

| Metric | Value |
| --- | --- |
| Run ID | 20260513T082956Z_full_70f1959a |
| Mode | full |
| Status | completed |
| Final unique ligands | 3460 |
| Docking rows | 1671 |
| Ranking rows | 934 |
| Top hits | 93 |
| Figures | 7 |

### Library and filtering summary

| Stage | Count |
| --- | --- |
| Merged repurposing ligands | 3460 |
| Rejected during preprocessing | 2526 |
| Retained for ranking | 934 |
| Retained as top hits | 93 |

### Docking and ranking output

- Successful docking rows: `1671`
- Top ranked candidates retained: `93`
- Best receptor score for `5E04`: `-8.730 kcal/mol`
- Best receptor score for `9P3Y`: `-6.523 kcal/mol`

#### Best receptor-wise candidates

| Receptor | Best ligand | Binding site | Best score (kcal/mol) |
| --- | --- | --- | --- |
| 5E04 | PAROXETINE_chembl490 | site_1 | -8.730 |
| 9P3Y | GRANISETRON_chembl289469 | site_1 | -6.523 |

#### Top 10 prioritized candidates

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

#### Common rejection reasons

| Rejection reason | Count |
| --- | --- |
| duplicate_inchikey | 1072 |
| below_top_rank_threshold | 841 |
| lipinski_failed | 667 |
| veber_failed | 114 |
| BRENK:Aliphatic_long_chain | 57 |
| BRENK:isolated_alkene | 38 |
| BRENK:aniline | 36 |
| BRENK:quaternary_nitrogen_2 | 29 |

### Figures

![Docking Score Distribution](plots/docking_score_distribution.png)

![Molecular Weight Distribution](plots/molecular_weight_distribution.png)

![Logp Distribution](plots/logp_distribution.png)

![Tpsa Distribution](plots/tpsa_distribution.png)

![Top Hit Score Comparison](plots/top_hit_score_comparison.png)

![Receptor Wise Score Comparison](plots/receptor_wise_score_comparison.png)

![Qsar Vs Docking Scatter](plots/qsar_vs_docking_scatter.png)

### Interpretation

The strongest computationally prioritized candidate in this uncapped repurposing screen was paroxetine, which docked best to the 5E04 receptor in this run. Several other approved-source compounds followed closely, but these are only in silico priorities and should not be interpreted as antiviral evidence.

## Limitations

- QSAR scores were heuristic, not trained on a validated project-specific model.
- ADMET predictions were rule-based or proxy estimates.
- Interaction analysis fell back to a geometric placeholder because PLIP and ProLIF were unavailable.
- Docking scores are not experimental binding data.
- No wet-lab or clinical claims are supported by this report.

## Reproducibility notes

- Remote run completed on the Ubuntu host with a timestamped output directory.
- The repurposing library was assembled from approved public sources and deduplicated before screening.
- The pipeline recorded configuration, runtime environment, and run metadata in the report bundle.

## Recommended next steps

1. Inspect the pose files for the top 10 ligands in ChimeraX or PyMOL and confirm that the docked orientations, contacts, and ring placements are chemically plausible.
2. Install PLIP or ProLIF on the remote host and rerun interaction analysis so the report includes explicit hydrogen-bond, hydrophobic, pi-stacking, and salt-bridge annotations instead of the geometric fallback.
3. Run a consensus rescoring step on the top 20 ligands if an additional scoring tool is available, then compare the ranking stability against the current Vina-only result.
4. Re-screen the top ligands against alternative binding-site definitions or receptor conformations if you want to test sensitivity to pocket uncertainty.
5. Expand the repurposing source set to include other curated approved libraries, then compare overlap in the top-ranked compounds before changing the screening logic.
6. Preserve this run as the baseline repurposing screen and use the same timestamped report bundle for future comparisons so results stay reproducible.
