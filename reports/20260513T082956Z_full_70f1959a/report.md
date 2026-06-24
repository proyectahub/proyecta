# Publication-ready manuscript draft: in silico repurposing screen against Andes orthohantavirus targets 9P3Y and 5E04

Run ID: `20260513T082956Z_full_70f1959a`  
Mode: `full`  
Status: `completed`

> This manuscript draft is strictly computational. It prioritizes approved-source repurposing candidates and does not claim antiviral efficacy, clinical benefit, or experimental validation.

## Abstract

We performed a reproducible, repurposing-oriented virtual screening campaign against two Andes orthohantavirus targets, PDB 9P3Y (glycoprotein complex / Gn-Gc-related structure) and PDB 5E04 (nucleoprotein). The ligand universe was assembled from approved or clinical-stage public compounds in ChEMBL and DrugCentral, deduplicated by InChIKey, and filtered using RDKit-based physicochemical, rule-based, and alert-driven curation. In total, 4,986 source records collapsed to 3,460 unique ligands, of which 934 survived preprocessing and 93 advanced to docking. AutoDock Vina generated 1,671 pose records across both receptors. The docking distribution favored 5E04 over 9P3Y, with mean best scores of -6.060 kcal/mol and -5.158 kcal/mol, respectively, and the strongest single pose observed for PAROXETINE_chembl490 at -8.730 kcal/mol against 5E04. Heuristic QSAR and rule-based ADMET scoring were used only for prioritization, not for activity claims. A PLIP rerun on the top pose set produced 76 residue-level interaction records concentrated on 5E04, dominated by hydrophobic contacts and hydrogen bonds around ARG146, ARG199, VAL219, ALA310, ASP312, PHE360, TYR364, and ARG367. The overall pattern indicates a tractable, receptor-skewed, and conservatively filtered shortlist of computationally prioritized candidates that merit follow-up only as hypotheses requiring experimental validation.

## Keywords

Andes orthohantavirus; hantavirus; drug repurposing; virtual screening; AutoDock Vina; PLIP; ProLIF; molecular docking; computational prioritization.

## 1. Description

The objective of this project was to build a reproducible computational prioritization pipeline for Andes orthohantavirus / Hantavirus using two viral protein targets: PDB 9P3Y and PDB 5E04. Rather than expanding chemical space de novo, the screen was deliberately restricted to approved or clinical-stage compounds from public repositories so that the resulting shortlist would be relevant to drug repurposing. This is a hypothesis-generation workflow only. It is designed to reduce a large approved-source library to a smaller, structure-based, and chemically tractable set of putative hits for downstream expert review.

The final integrated output combines ligand curation, heuristic QSAR and ADMET prioritization, docking with AutoDock Vina, residue-level interaction analysis with PLIP, PyMOL rendering of the top poses, and a composite ranking framework that balances docking, physicochemical tractability, and multi-target behavior.

## 2. Methodology

### 2.1 Study design and reproducibility

The pipeline was executed in full screening mode with a fixed random seed of 42 and timestamped output directories to avoid silent overwrites. The active run bundle records the configuration hash, command line, timestamp, operating system, Python version, and package/tool versions so that the exact computational context can be reconstructed.

| Field | Value |
| --- | --- |
| Run ID | 20260513T082956Z_full_70f1959a |
| Mode | full |
| Status | completed |
| Config hash | 70f1959a2400901fa0c7ce9e5c8925e20ef7dbeee0a355c80d4cadb102c3b84f |
| Timestamp (UTC) | 20260513T082956Z |
| Python | 3.12.3 |
| Implementation | CPython |
| OS | Linux |
| Platform | Linux-6.6.87.2-microsoft-standard-WSL2-x86_64-with-glibc2.39 |
| Machine | x86_64 |
| Random seed | 42 |
| Command line | python main.py --config configs/config_repurposing.yaml --mode full |
| NumPy | 1.26.4 |
| pandas | 3.0.3 |
| matplotlib | 3.10.9 |
| SciPy | 1.11.4 |
| joblib | 1.5.3 |
| requests | 2.31.0 |
| AutoDock Vina | AutoDock Vina v1.2.5 |
| Open Babel | Open Babel 3.1.1 -- Mar 31 2024 -- 06:39:03 |
| PLIP | 2.3.0+dfsg-2 |
| ProLIF | 2.1.0 |
| MDAnalysis | 2.10.0 |

### 2.2 Approved-source repurposing library

The ligand library was assembled at runtime from two approved-source collections: ChEMBL clinical / approved small molecules and DrugCentral approved compounds. Records were deduplicated by InChIKey to remove overlap across sources, then standardized before docking.

| Source | Fetched records | Filter scope | Type | Source URL |
| --- | --- | --- | --- | --- |
| ChEMBL | 3127 | max_phase=4 | Small molecule | https://www.ebi.ac.uk/chembl/api/data/molecule.json |
| DrugCentral | 1859 | fda | Approved public compounds | https://drugcentral.org/static/FDA_Approved.csv |

### 2.3 Ligand preparation and filtering

Ligands were standardized, salts and fragments were removed when appropriate, charges were neutralized when possible, and 3D conformers were generated for docking-ready export. RDKit descriptors were calculated for each record, including molecular weight, cLogP, TPSA, hydrogen bond donors and acceptors, rotatable bonds, formal charge, fraction Csp3, aromatic ring count, and QED. Lipinski, Veber, PAINS, and BRENK filters were applied conservatively.

| Filter / setting | Value |
| --- | --- |
| QSAR mode | heuristic baseline |
| Model path | not configured |
| Top fraction selected | 0.100 |
| Morgan radius | 2 |
| Morgan bits | 2048 |
| MW max | 500.000 |
| LogP max | 5.000 |
| TPSA max | 140.000 |
| HBD max | 5 |
| HBA max | 10 |
| Rotatable bonds max | 10 |
| Absolute charge max | 1 |
| PAINS max | 0 |
| BRENK max | 0 |

### 2.4 Receptor preparation and docking

The pipeline targeted PDB 9P3Y and PDB 5E04, removed waters by default, selected chain A for docking, and used explicitly defined docking boxes. AutoDock Vina was run with exhaustiveness 8, 9 poses per ligand, energy range 3, 2 workers, and one retry for failed jobs.

| Receptor | Binding site | Center | Size | Remove waters | Chains | Note |
| --- | --- | --- | --- | --- | --- | --- |
| 9P3Y | site_1 | 148.302, 138.954, 161.363 | 23.623, 24.344, 28.995 | True | A | Centered on the crystallographic NAG site in the prepared 9P3Y structure. |
| 5E04 | site_1 | -32.715, -15.712, 45.022 | 33.721, 43.327, 40.402 | True | A | Centered on the RNA-binding crevice of chain A using structure-derived residue geometry. |

| Docking parameter | Value |
| --- | --- |
| Exhaustiveness | 8 |
| Number of poses | 9 |
| Energy range | 3 |
| Retry failed jobs | 1 |
| Workers | 2 |
| Vina executable | vina |



### 2.5 Molecular dynamics preparation and GPU execution

Molecular dynamics (MD) simulations were configured as a post-docking computational stability assessment for the prioritized protein-ligand complexes and selected controls. The purpose of this stage was to evaluate pose stability and system behavior after docking, not to infer antiviral efficacy or experimental binding affinity. The MD systems were prepared from the best Vina poses selected for follow-up: `PAROXETINE_chembl490` with the Andes virus nucleoprotein target `5E04`, `GRANISETRON_chembl289469` with the glycoprotein-associated target `9P3Y`, and computational controls including `RIBAVIRIN_control` for `5E04` and `NAG_structural_control` / crystallographic NAG redocking context for `9P3Y`.

Protein coordinates were taken from the prepared receptor structures generated by the docking pipeline. Ligand poses were converted from docking output to MD-compatible coordinate files, and ligand parameterization was performed through ACPYPE/Antechamber using GAFF2-compatible small-molecule parameters. For ligands that initially failed Antechamber due to odd-electron or protonation inconsistencies after PDBQT/MOL2 conversion, the ligand inputs were re-exported as SDF files with explicit hydrogens (`ligand_acpype_input_h.sdf`) before relaunch. This correction was applied to the paroxetine, granisetron, and ribavirin MD jobs before queuing the final 50 ns CUDA production runs.

All MD jobs used GROMACS 2025.3 with the `amber99sb-ildn` force field for the protein and TIP3P water. Systems were placed in a dodecahedral solvent box with a 1.0 nm minimum padding between the solute complex and box boundary. The systems were solvated, neutralized, and adjusted to 0.15 M NaCl using `gmx solvate` and `gmx genion`. The thermodynamic state was set to 310 K and 1 bar to approximate physiological temperature and pressure. Energy minimization was followed by short NVT and NPT equilibration stages before production MD.

| MD parameter | Value used |
| --- | --- |
| MD engine | GROMACS 2025.3 CUDA |
| Protein force field | amber99sb-ildn |
| Ligand parameterization | ACPYPE / Antechamber, GAFF2-compatible workflow |
| Water model | TIP3P |
| Box geometry | Dodecahedral |
| Minimum solute-box padding | 1.0 nm |
| Ionic strength | 0.15 M NaCl |
| Neutralization | Sodium/chloride ions with `gmx genion` |
| Temperature | 310 K |
| Pressure | 1 bar |
| Energy minimization | 10,000 steps |
| NVT equilibration | 10 ps |
| NPT equilibration | 10 ps + 10 ps final NPT stage |
| Production length | 50 ns per queued production system |
| Production time step | 2 fs |
| Constraints | Hydrogen bonds (`h-bonds`) |
| Thermostat | V-rescale |
| Barostat | Parrinello-Rahman |
| MPI/OpenMP layout | `ntmpi=1`, `ntomp=16` |
| GPU offload | `-nb gpu -pme gpu -bonded gpu -update gpu` |
| GPU device | NVIDIA GeForce RTX 5080, `gpu_id=0` |

The production runs were configured to use the CUDA-enabled GROMACS binary directly (`/opt/gromacs-cuda-2025.3/bin/gmx`) rather than the generic wrapper when GPU execution was required. The active CUDA command used for production continuation was:

```bash
/opt/gromacs-cuda-2025.3/bin/gmx mdrun \
  -nb gpu -pme gpu -bonded gpu -update gpu \
  -gpu_id 0 \
  -deffnm md \
  -ntmpi 1 -ntomp 16 \
  -cpi md.cpt -append -cpt 10
```

The GPU-enabled run log confirmed that short-range nonbonded interactions, PME, bonded interactions, coordinate updates, and constraints were offloaded to the GPU. The `9P3Y + NAG_structural_control` system was re-started from an existing checkpoint (`md.cpt`) and continued without discarding prior trajectory progress. Subsequent corrected 50 ns systems were placed in the GROMACS portal queue with GPU execution enabled.

| MD follow-up system | Role | Production status at setup | Notes |
| --- | --- | --- | --- |
| 5E04 + PAROXETINE_chembl490 | Primary 5E04 repurposing candidate | Queued for 50 ns CUDA MD | Relaunched with explicit-hydrogen SDF for ACPYPE |
| 9P3Y + GRANISETRON_chembl289469 | Primary 9P3Y repurposing candidate | Queued for 50 ns CUDA MD | Relaunched with explicit-hydrogen SDF for ACPYPE |
| 5E04 + RIBAVIRIN_control | Antiviral computational reference | Queued for 50 ns CUDA MD | Control/reference only; not a validated target-specific binder |
| 9P3Y + NAG_structural_control | Glycan/structural control | Running as 50 ns CUDA MD | Continued from checkpoint using direct CUDA GROMACS |

MD trajectories are interpreted strictly as computational pose-stability and system-behavior analyses. They do not establish antiviral activity, target engagement, clinical relevance, or experimental binding. Additional post-MD analyses should include RMSD, RMSF, radius of gyration, hydrogen-bond persistence, ligand-protein contact occupancy, ligand RMSD relative to the docked pose, and energy/temperature/pressure stability checks.

### 2.6 QSAR, ADMET, and composite ranking

No local supervised QSAR model was configured for this run, so the pipeline used a transparent heuristic baseline based on drug-likeness, physicochemical properties, alert counts, and optional similarity-like terms. ADMET scoring was likewise conservative and rule-based. These scores were used strictly for prioritization, not for biological inference.

| Ranking component | Weight |
| --- | --- |
| Docking | 0.450 |
| QSAR | 0.250 |
| ADMET | 0.200 |
| Drug-likeness | 0.050 |
| Toxicity | 0.050 |
| Multi-target | 0.100 |

The top 10 percent of accepted ligands were selected for docking, and the final composite score integrated docking, QSAR, ADMET, drug-likeness, toxicity, and multi-target behavior with configurable weights.

### 2.7 Interaction analysis and PyMOL rendering

The archived screening bundle was rerun with a PLIP-enabled interaction backend on the top pose set. Interaction annotations were reduced to residue-level hydrogen bonds, hydrophobic contacts, pi-pi stacking, cation-pi interactions, salt bridges, and halogen bonds. The top 10 PLIP-supported poses were rendered in PyMOL to create a cleaned gallery with residue labels only, avoiding the visual clutter caused by dense distance annotations.

## 3. Results

### 3.1 Library curation outcomes

The merged approved-source library contained 4,986 raw fetched records and 3,460 unique ligands after deduplication. Of these, 2,526 were rejected during preprocessing and 934 were retained for ranking. The preprocessing acceptance rate was 27.0% of the unique merged library. Only the top 93 ligands (10.0%) were advanced to docking.

| Metric | Value |
| --- | --- |
| Raw fetched ligands | 4986 |
| Unique deduplicated ligands | 3460 |
| Accepted after preprocessing | 934 |
| Rejected during preprocessing | 2526 |
| Selected for docking | 93 |
| Docking pose rows | 1671 |
| Ranking rows | 934 |
| Ranked-out candidates | 841 |

The rejection profile was dominated by duplicate structures and explicit drug-likeness or structural alert filters, which is expected in an approved-source union.

| Preprocessing rejection reason | Count |
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

### 3.2 Docking results by receptor

Docking produced 1,671 successful pose records split almost evenly between the two targets. The score distribution was clearly shifted toward more favorable values for 5E04, indicating that the approved-source library and the selected binding site were more complementary to the nucleoprotein pocket than to the 9P3Y pocket under the current configuration.

| Receptor | Pose count | Mean | Median | Min | Max |
| --- | --- | --- | --- | --- | --- |
| 5E04 | 835 | -6.060 | -6.048 | -8.730 | -4.493 |
| 9P3Y | 836 | -5.158 | -5.181 | -6.523 | -3.912 |

The mean best score for 5E04 was approximately 0.90 kcal/mol more favorable than for 9P3Y. The strongest single pose was PAROXETINE_chembl490 against 5E04 at -8.730 kcal/mol, while the best 9P3Y pose was GRANISETRON_chembl289469 at -6.523 kcal/mol.

| Receptor | Best ligand | Site | Best score (kcal/mol) |
| --- | --- | --- | --- |
| 5E04 | PAROXETINE_chembl490 | site_1 | -8.730 |
| 9P3Y | GRANISETRON_chembl289469 | site_1 | -6.523 |

### 3.3 Top-ranked computationally prioritized candidates

The top 10 candidates were all favored by 5E04, which means the composite ranking was driven primarily by the docking term while still being moderated by QSAR and ADMET. The top compounds remained inside a narrow drug-like envelope, which is desirable for repurposing because it prioritizes tractable chemotypes rather than extreme outliers.

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

Among the top-ranked compounds, PAROXETINE_chembl490 combined the most favorable docking score with a high QED and a balanced polar surface profile. MINAPRINE_chembl278819, dolasetron_dc3931, leflunomide_chembl960, nateglinide_chembl783, and dapiprazole_chembl1201216 followed closely, showing that the shortlist is dominated by approved or clinically familiar scaffolds rather than chemically exotic structures.

### 3.4 Interaction fingerprint of the top pose set

The PLIP rerun generated 76 interaction records across 10 ligands and a single receptor site. Hydrophobic contacts and hydrogen bonds dominated the interaction spectrum, with smaller contributions from cation-pi, pi-pi stacking, salt bridges, and one halogen bond. The residue distribution points to a compact interaction network around the 5E04 pocket.

| Interaction type | Count |
| --- | --- |
| hydrophobic_contact | 44 |
| hydrogen_bond | 22 |
| cation_pi | 3 |
| pi_pi_stacking | 3 |
| salt_bridge | 3 |
| halogen_bond | 1 |

| Top interacting residue | Count |
| --- | --- |
| TYR364 | 10 |
| TYR125 | 8 |
| PHE360 | 7 |
| ARG367 | 7 |
| ALA310 | 6 |
| VAL219 | 5 |
| ARG199 | 5 |
| ASP312 | 4 |
| ARG156 | 4 |
| GLN335 | 3 |

The dominant residues were TYR364, TYR125, ARG367, PHE360, ALA310, ARG199, VAL219, ARG146, ASP312, and GLN335. This recurrent residue cluster is useful because it provides a mechanistic anchor for follow-up pose inspection and for future consensus rescoring or pocket-ensemble comparisons.

The most heavily annotated ligands in the PLIP rerun were as follows:

| Ligand | Interaction count | Best docking | Composite | Key residues |
| --- | --- | --- | --- | --- |
| INDAPAMIDE_chembl406 | 10 | -7.351 | 0.715 | TYR125, ARG156, TYR178, ILE193 |
| NATEGLINIDE_chembl783 | 10 | -7.524 | 0.746 | ARG156, SER180, ILE193, TYR125, LYS189, GLU191, GLU192 |
| PAROXETINE_chembl490 | 10 | -8.730 | 0.881 | ARG367, ARG146, ARG199, ASP312, TYR364, VAL219, PHE360 |
| dolasetron_dc3931 | 8 | -7.811 | 0.776 | ARG146, GLN335, ALA310, ASP312, PHE360, TYR364 |
| CINOXACIN_chembl1208 | 7 | -7.482 | 0.730 | ARG367, GLN335, SER363, VAL219, ALA310, TYR364 |
| INDOPROFEN_chembl15870 | 7 | -7.543 | 0.737 | GLY145, ALA310, ASP312, VAL219, PHE360, TYR364, ARG199 |
| MINAPRINE_chembl278819 | 7 | -7.900 | 0.789 | GLN335, ARG199, PHE307, ALA310, PHE331, PHE360, TYR364 |
| AGOMELATINE_chembl10878 | 6 | -7.547 | 0.742 | SER217, VAL219, TYR364, PHE360 |
| LEFLUNOMIDE_chembl960 | 6 | -7.791 | 0.760 | ARG367, ASP312, TYR364, ALA310, PHE307 |
| DAPIPRAZOLE_chembl1201216 | 5 | -7.557 | 0.746 | ARG367, ALA310, PHE360, TYR364 |

This interaction profile shows that contact count and composite rank are related but not identical. That is analytically useful: a compound can score well overall while another shows a denser residue footprint, so residue-level inspection adds orthogonal information to the docking ranking.

### 3.5 Figures

#### Docking score distribution

![Docking score distribution](plots/docking_score_distribution.png)

*Figure 1. Best docking score distribution across the screened receptors.*

#### Molecular weight distribution

![Molecular weight distribution](plots/molecular_weight_distribution.png)

*Figure 2. Molecular weight distribution after curation and ranking.*

#### LogP distribution

![LogP distribution](plots/logp_distribution.png)

*Figure 3. cLogP distribution of accepted ligands.*

#### TPSA distribution

![TPSA distribution](plots/tpsa_distribution.png)

*Figure 4. TPSA distribution of the accepted ligand set.*

#### QSAR vs docking scatter

![QSAR vs docking scatter](plots/qsar_vs_docking_scatter.png)

*Figure 5. Heuristic QSAR score versus docking score for prioritized compounds.*

#### Top hit score comparison

![Top hit score comparison](plots/top_hit_score_comparison.png)

*Figure 6. Composite score comparison for the top prioritized ligands.*

#### Receptor-wise score comparison

![Receptor-wise score comparison](plots/receptor_wise_score_comparison.png)

*Figure 7. Best docking scores for the top hits across the two receptors.*

#### Modern docking annex

![Docking score violin by receptor](modern_docking_figures/01_docking_score_violin_by_receptor.png)

![Top ligands receptor heatmap](modern_docking_figures/02_top_hits_receptor_heatmap.png)

![Top 10 composite score breakdown](modern_docking_figures/03_top10_composite_breakdown.png)

![Pareto docking / ADMET / QSAR](modern_docking_figures/04_pareto_docking_admet_qsar.png)

![Top 15 receptor comparison](modern_docking_figures/05_receptor_comparison_top15.png)

*Modern docking figures highlighting the receptor-level score spread, top-hit heatmap, composite decomposition, Pareto view, and receptor comparison for the top 15 ligands.*

#### PLIP / PyMOL gallery

![PLIP PyMOL contact sheet](plip_pymol_images/plip_pymol_contact_sheet.png)

*A compact contact sheet of the top 10 PLIP-supported poses rendered in PyMOL with residue labels reduced to the key contacts only.*

Full pose-by-pose gallery: [plip_pymol_gallery.md](plip_pymol_images/plip_pymol_gallery.md)

## Extended methodology and robustness analyses

### Target selection and pocket rationale

The two computational targets were selected because they provide complementary structural hypotheses for Andes orthohantavirus repurposing. PDB 9P3Y is a glycoprotein-related structure with a NAG-associated region that can be treated as an exploratory ligandable pocket. PDB 5E04 is a nucleoprotein core structure that provides a structurally motivated RNA-binding crevice. These sites support hypothesis generation but do not establish druggability or biological efficacy.

| pdb_id | protein_complex_name | virus_or_organism | experimental_method | resolution_angstrom | selected_chain | selected_site | crystallographic_ligands | pocket_rationale | site_limitation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 9P3Y | Andes virus glycoprotein tetramer in complex with ADI-65534 Fab | Andes virus | ELECTRON MICROSCOPY | unavailable | A | site_1 | NAG | Exploratory glycan-associated / NAG-associated pocket suggested by the prepared structure. | EM structure with substantial missing-residue annotations; pocket is exploratory and not validated as druggable. |
| 5E04 | Crystal structure of Andes virus nucleoprotein | Andes virus | X-RAY DIFFRACTION | 2.250 | A | site_1 | none | Structurally motivated RNA-binding crevice in the nucleoprotein core region. | X-ray structure is informative but does not represent the complete viral ribonucleoprotein context. |

### Docking protocol validation and sensitivity analysis

Docking validation was designed to test internal robustness rather than biological activity. Reference/control compounds are treated strictly as computational comparison molecules, and the decoy set was matched approximately by molecular weight and cLogP from the accepted-source library. When available, control compounds and matched decoys were docked against the prepared receptors and compared with the current top-ranked candidates.

| analysis_type | group | ligand_count | mean_best_score | median_best_score | best_score | worst_score | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| docking_validation | control | 3 | NA | NA | NA | NA | Reference/control compounds for computational comparison only |
| docking_validation | decoy | 30 | NA | NA | NA | NA | Background decoys or top-ranked candidates |
| docking_validation | top_hit | 93 | -7.418 | -7.263 | -8.730 | -6.974 | Background decoys or top-ranked candidates |

### Docking box sensitivity

Previously generated docking-box perturbation results were reused from the active run directory. Small perturbations around the original docking box test whether the shortlist is stable to moderate box-definition uncertainty. Lower score variance across box variants suggests a more robust pose hypothesis, whereas high variance indicates sensitivity to the specific pocket definition.

| ligand_id | receptor_id | binding_site_id | score_mean | score_std | score_min | score_max | box_count | score_range | stability_rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AGOMELATINE_chembl10878 | 5E04 | site_1 | -6.167 | 0.584 | -7.590 | -5.230 | 72 | 2.360 | 18.000 |
| AGOMELATINE_chembl10878 | 9P3Y | site_1 | -5.191 | 0.202 | -5.676 | -4.772 | 71 | 0.904 | 7.000 |
| CINOXACIN_chembl1208 | 5E04 | site_1 | -6.136 | 0.508 | -7.487 | -5.526 | 71 | 1.961 | 16.000 |
| CINOXACIN_chembl1208 | 9P3Y | site_1 | -5.133 | 0.137 | -5.388 | -4.839 | 72 | 0.549 | 1.000 |
| DAPIPRAZOLE_chembl1201216 | 5E04 | site_1 | -7.012 | 0.333 | -7.781 | -6.263 | 72 | 1.518 | 11.000 |
| DAPIPRAZOLE_chembl1201216 | 9P3Y | site_1 | -5.846 | 0.191 | -6.148 | -5.366 | 72 | 0.782 | 5.000 |
| INDAPAMIDE_chembl406 | 5E04 | site_1 | -6.807 | 0.425 | -7.489 | -5.845 | 72 | 1.644 | 13.000 |
| INDAPAMIDE_chembl406 | 9P3Y | site_1 | -6.063 | 0.223 | -6.384 | -5.422 | 72 | 0.962 | 8.000 |
| INDOPROFEN_chembl15870 | 5E04 | site_1 | -6.642 | 0.476 | -7.544 | -6.027 | 72 | 1.517 | 15.000 |
| INDOPROFEN_chembl15870 | 9P3Y | site_1 | -5.747 | 0.181 | -6.022 | -5.086 | 72 | 0.936 | 3.000 |
| LEFLUNOMIDE_chembl960 | 5E04 | site_1 | -6.727 | 0.669 | -8.114 | -5.212 | 71 | 2.902 | 19.000 |
| LEFLUNOMIDE_chembl960 | 9P3Y | site_1 | -5.389 | 0.158 | -5.678 | -5.053 | 72 | 0.625 | 2.000 |

### Consensus docking / rescoring

Single-score docking is limited because any one scoring function can over-weight a particular chemical feature or pocket geometry. To address this, the top-ranked ligands were optionally rescored with any secondary scoring functions available in the environment, and the combined consensus rank was computed from rank-normalized scores rather than raw score magnitudes. This improves prioritization robustness, but it still does not estimate a true binding free energy.

| consensus_position | ligand_id | vina_score | secondary_score | secondary_tool | rank_stability |
| --- | --- | --- | --- | --- | --- |
| 1 | PAROXETINE_chembl490 | -8.730 | -6.040 | vina_vinardo | 0.000 |
| 2 | LEFLUNOMIDE_chembl960 | -7.791 | -5.819 | vina_vinardo | 0.000 |
| 3 | MINAPRINE_chembl278819 | -7.900 | -5.372 | vina_vinardo | 0.000 |
| 4 | AGOMELATINE_chembl10878 | -7.547 | -5.756 | vina_vinardo | 0.000 |
| 5 | NATEGLINIDE_chembl783 | -7.524 | -6.037 | vina_vinardo | 0.000 |
| 6 | INDOPROFEN_chembl15870 | -7.543 | -5.474 | vina_vinardo | 0.000 |
| 7 | DAPIPRAZOLE_chembl1201216 | -7.557 | -4.958 | vina_vinardo | 0.000 |
| 8 | dolasetron_dc3931 | -7.811 | -4.660 | vina_vinardo | 0.000 |
| 9 | INDAPAMIDE_chembl406 | -7.351 | -5.221 | vina_vinardo | 0.000 |
| 10 | MAVACAMTEN_chembl4297517 | -7.150 | -5.104 | vina_vinardo | 0.000 |
| 11 | CINOXACIN_chembl1208 | -7.482 | -4.931 | vina_vinardo | 0.000 |
| 12 | TOLAZAMIDE_chembl817 | -7.174 | -4.948 | vina_vinardo | 0.000 |

### Clinical repurposing context of prioritized candidates

The shortlist is enriched for approved or clinical compounds, which is useful for repurposing because regulatory familiarity may reduce the uncertainty of the chemical starting point. However, regulatory status does not imply antiviral activity and should not be presented as evidence of target engagement. Where local metadata were informative, the table below highlights the drug class or likely pharmacological context of the top candidates.

| ligand_id | source_name | source_db_id | source_database | approval_status | therapeutic_class_or_indication | computational_rank | best_receptor | best_docking_score_kcal_mol | qed | clogp | tpsa | safety_interpretation_warning |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PAROXETINE_chembl490 | PAROXETINE\|paroxetine | 2068\|CHEMBL490 | ChEMBL\|DrugCentral | approved | CNS-active SSRI | 1 | 5E04 | -8.730 | 0.934 | 3.327 | 39.720 | CNS-off-target profile may complicate repurposing interpretation. Clinical approval does not imply antiviral activity; interpret as a computational repurposing candidate only. |
| MINAPRINE_chembl278819 | MINAPRINE | CHEMBL278819 | ChEMBL | approved | Historical CNS-active agent | 2 | 5E04 | -7.900 | 0.917 | 2.196 | 50.280 | Legacy compounds may have limited translational value. Clinical approval does not imply antiviral activity; interpret as a computational repurposing candidate only. |
| dolasetron_dc3931 | dolasetron | 3931 | DrugCentral | approved | Antiemetic 5-HT3 antagonist | 3 | 5E04 | -7.811 | 0.862 | 2.519 | 62.400 | Use as a repurposing candidate only in a computational context. Clinical approval does not imply antiviral activity; interpret as a computational repurposing candidate only. |
| LEFLUNOMIDE_chembl960 | LEFLUNOMIDE\|leflunomide | 1552\|CHEMBL960 | ChEMBL\|DrugCentral | approved | Immunomodulatory disease-modifying agent | 4 | 5E04 | -7.791 | 0.911 | 3.254 | 55.130 | Immune-modulating pharmacology requires cautious interpretation. Clinical approval does not imply antiviral activity; interpret as a computational repurposing candidate only. |
| NATEGLINIDE_chembl783 | NATEGLINIDE\|nateglinide | 1886\|CHEMBL783 | ChEMBL\|DrugCentral | approved | Antidiabetic agent | 5 | 5E04 | -7.524 | 0.846 | 3.261 | 66.400 | Metabolic pharmacology should not be overinterpreted as antiviral activity. Clinical approval does not imply antiviral activity; interpret as a computational repurposing candidate only. |
| DAPIPRAZOLE_chembl1201216 | DAPIPRAZOLE\|dapiprazole | 781\|CHEMBL1201216 | ChEMBL\|DrugCentral | approved | Ophthalmic alpha-adrenergic antagonist | 6 | 5E04 | -7.557 | 0.864 | 2.288 | 37.190 | Local ophthalmic use limits direct translational inference. Clinical approval does not imply antiviral activity; interpret as a computational repurposing candidate only. |
| AGOMELATINE_chembl10878 | AGOMELATINE | CHEMBL10878 | ChEMBL | approved | Melatonergic antidepressant | 7 | 5E04 | -7.547 | 0.896 | 2.527 | 38.330 | CNS activity warrants cautious interpretation. Clinical approval does not imply antiviral activity; interpret as a computational repurposing candidate only. |
| INDOPROFEN_chembl15870 | INDOPROFEN | CHEMBL15870 | ChEMBL | approved | NSAID | 8 | 5E04 | -7.543 | 0.940 | 3.035 | 57.610 | Anti-inflammatory action does not imply antiviral efficacy. Clinical approval does not imply antiviral activity; interpret as a computational repurposing candidate only. |
| CINOXACIN_chembl1208 | CINOXACIN\|cinoxacin | 657\|CHEMBL1208 | ChEMBL\|DrugCentral | approved | Quinolone antibacterial | 9 | 5E04 | -7.482 | 0.862 | 0.843 | 90.650 | Antibacterial class does not imply antiviral activity. Clinical approval does not imply antiviral activity; interpret as a computational repurposing candidate only. |
| INDAPAMIDE_chembl406 | INDAPAMIDE\|indapamide | 1433\|CHEMBL406 | ChEMBL\|DrugCentral | approved | Thiazide-like diuretic | 10 | 5E04 | -7.351 | 0.871 | 2.083 | 92.500 | A diuretic scaffold is not evidence of target engagement. Clinical approval does not imply antiviral activity; interpret as a computational repurposing candidate only. |

### Computational ADMET and off-target liability profiling

The expanded ADMET layer adds transparent computational risk flags to the existing rule-based profile. These flags are not safety conclusions. They are intended to help the reader interpret which shortlisted compounds may carry higher lipophilicity, CNS penetration potential, P-gp / CYP liability, or reactive-structure concerns.

| ligand_id | molecular_weight | logp | tpsa | rotatable_bonds | formal_charge | high_lipophilicity | high_tpsa | cns_penetration_proxy | herg_risk_proxy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PAROXETINE_chembl490 | 329.371 | 3.327 | 39.720 | 4 | 0 | 0 | 0 | 1 | 1 |
| MINAPRINE_chembl278819 | 298.390 | 2.196 | 50.280 | 5 | 0 | 0 | 0 | 1 | 0 |
| dolasetron_dc3931 | 324.380 | 2.519 | 62.400 | 2 | 0 | 0 | 0 | 1 | 0 |
| LEFLUNOMIDE_chembl960 | 270.210 | 3.254 | 55.130 | 2 | 0 | 0 | 0 | 1 | 1 |
| NATEGLINIDE_chembl783 | 317.429 | 3.261 | 66.400 | 6 | 0 | 0 | 0 | 1 | 1 |
| DAPIPRAZOLE_chembl1201216 | 325.460 | 2.288 | 37.190 | 4 | 0 | 0 | 0 | 1 | 0 |
| AGOMELATINE_chembl10878 | 243.306 | 2.527 | 38.330 | 4 | 0 | 0 | 0 | 1 | 0 |
| INDOPROFEN_chembl15870 | 281.311 | 3.035 | 57.610 | 3 | 0 | 0 | 0 | 1 | 1 |
| CINOXACIN_chembl1208 | 262.221 | 0.843 | 90.650 | 2 | 0 | 0 | 0 | 0 | 0 |
| INDAPAMIDE_chembl406 | 365.842 | 2.083 | 92.500 | 3 | 0 | 0 | 0 | 0 | 0 |
| TOLAZAMIDE_chembl817 | 311.407 | 1.774 | 78.510 | 3 | 0 | 0 | 0 | 1 | 0 |
| PREDNISONE_chembl635 | 358.434 | 1.766 | 91.670 | 2 | 0 | 0 | 0 | 0 | 0 |

### Chemical diversity and scaffold distribution

The shortlist was examined using Morgan fingerprints, pairwise Tanimoto similarity, Bemis–Murcko scaffolds, and a simple PCA-like projection of fingerprint space. This helps determine whether the rank list is chemically concentrated around a small number of related cores or instead spans multiple scaffold families.

| scaffold | count |
| --- | --- |
| O=C1C=CC2C(=C1)CCC1C3CCCC3CC(=O)C21 | 2 |
| c1ccc(C2CCCCC2)cc1 | 2 |
| c1ccc(C2CCNCC2COc2ccc3c(c2)OCO3)cc1 | 1 |
| c1ccc(-c2ccc(NCCN3CCOCC3)nn2)cc1 | 1 |
| O=C(OC1CC2CC3CC(C1)N2CC3=O)c1c[nH]c2ccccc12 | 1 |
| O=C(Nc1ccccc1)c1cnoc1 | 1 |
| O=C(NCCc1ccccc1)C1CCCCC1 | 1 |
| c1ccc(N2CCN(CCc3nnc4n3CCCC4)CC2)cc1 | 1 |
| c1ccc2ccccc2c1 | 1 |
| O=C1c2ccccc2CN1c1ccccc1 | 1 |

### Residue-level interaction fingerprinting

Residue-level interaction fingerprints were extracted from the PLIP-backed annotation table. The resulting matrix indicates how often each ligand contacts each residue and therefore highlights recurrent pocket features rather than single-pose coincidences.

| receptor_residue | count | persistence_fraction |
| --- | --- | --- |
| TYR364 | 10 | 1.000 |
| TYR125 | 8 | 0.800 |
| PHE360 | 7 | 0.700 |
| ARG367 | 7 | 0.700 |
| ALA310 | 6 | 0.600 |
| VAL219 | 5 | 0.500 |
| ARG199 | 5 | 0.500 |
| ASP312 | 4 | 0.400 |
| ARG156 | 4 | 0.400 |
| GLN335 | 3 | 0.300 |
| ARG146 | 3 | 0.300 |
| ILE193 | 2 | 0.200 |
| PHE307 | 2 | 0.200 |
| TYR178 | 2 | 0.200 |
| GLU191 | 1 | 0.100 |

## Limitations and validation roadmap

### Limitations

- Docking scores are not experimental affinities.
- Receptor rigidity during docking can bias pose selection.
- Scoring-function bias and protonation/tautomer uncertainty remain material sources of error.
- The selected docking boxes can bias the apparent ranking.
- 9P3Y NAG-centered pocket is exploratory rather than validated as druggable.
- The 5E04 pocket does not represent the complete viral ribonucleoprotein context.
- No molecular dynamics simulations were included at this stage.
- No biochemical, biophysical, cellular, or animal validation was performed in this computational analysis.
- QSAR and ADMET layers are heuristic / model-dependent and require experimental validation.

### Proposed experimental validation roadmap

- Purified protein binding assay at the target level.
- RNA-protein displacement assay concept for the nucleoprotein target.
- Orthogonal biophysical confirmation of the most persistent pose hypotheses.
- Cytotoxicity counterscreen for prioritized candidates.
- Pseudotyped-entry assay concept for glycoprotein-related hypotheses.
- Institutional biosafety and ethical oversight before any wet-lab follow-up.

## 4. Discussion

The strongest analytical signal in this screen is receptor asymmetry. Under the current pocket definition, 5E04 consistently outperforms 9P3Y across the distribution, the top-hit list, and the interaction rerun. That does not establish biological superiority, but it does indicate that the approved-source chemotypes sampled here are more complementary to the 5E04 pocket than to the 9P3Y pocket in the present model.

The ranked list is chemically coherent: the leading compounds are moderate in molecular weight, avoid extreme lipophilicity, and remain within a fairly narrow TPSA range. That matters for repurposing because it suggests the pipeline is not simply promoting high-scoring but chemically implausible ligands. The curated library and explicit alert filters also removed obvious liabilities early, reducing the risk of over-interpreting noisy structures.

The PLIP rerun adds a mechanistic layer that was missing from the original technical bundle. The repeated appearance of ARG146, ARG199, VAL219, ALA310, ASP312, PHE360, TYR364, and ARG367 suggests a stable interaction subnetwork inside the 5E04 pocket. This is exactly the kind of information that should guide a next-round review, because a residue-consistent interaction motif is more informative than a single docking score alone.

At the same time, the limitations remain material: the QSAR and ADMET layers are heuristic; docking scores are not free energies; and the interactions are still computational annotations rather than experimental contact maps. Therefore the output should be treated as a ranked hypothesis set, not as evidence of antiviral efficacy or drug safety.

## 5. Conclusion

This work delivers a publication-style, fully reproducible in silico repurposing screen against Andes orthohantavirus targets 9P3Y and 5E04. The final shortlist is dominated by approved or clinical compounds with favorable docking geometry, a coherent drug-like property envelope, and a PLIP-supported interaction network concentrated in the 5E04 pocket. The most prioritized computational candidates are PAROXETINE_chembl490, MINAPRINE_chembl278819, dolasetron_dc3931, leflunomide_chembl960, and nateglinide_chembl783. These compounds should be described only as computationally prioritized candidates or putative hits that require experimental validation.

## Data availability

The complete screening bundle is stored in `reports/20260513T082956Z_full_70f1959a`. Key outputs include `top_hits.csv`, `receptor_rankings.csv`, `rejected_hits.csv`, `vina_docking_results.csv`, `interaction_rerun/interaction_annotations.csv`, and the figure directories under `plots/`, `modern_docking_figures/`, and `plip_pymol_images/`.

Extended-methodology outputs are stored under `extended_methodology/`, including docking validation, consensus rescoring, ADMET/off-target profiling, chemical diversity, residue fingerprinting, limitations, and manuscript-ready insert sections.

## Code availability

The pipeline code is contained in the repository under `src/` and `scripts/`. The manuscript draft can be regenerated from the saved bundle with the dedicated report builder script included in this repository.

## Ethics and biosafety note

This project is strictly computational and does not include wet-lab protocols, viral culture methods, pathogen engineering, enhancement instructions, or clinical claims. The output is intended for in silico prioritization only and must not be interpreted as evidence of therapeutic efficacy.

## Supplementary material

The full PLIP/PyMOL pose gallery is available as a companion markdown file in `plip_pymol_images/plip_pymol_gallery.md`. The contact sheet embedded above provides a compact overview of the top 10 poses, while the gallery file contains the per-pose overview and surface renderings.

### Supplementary Table S1. PLIP-supported pose summary

| Ligand | Interaction count | Best docking | Composite | Key residues |
| --- | --- | --- | --- | --- |
| INDAPAMIDE_chembl406 | 10 | -7.351 | 0.715 | TYR125, ARG156, TYR178, ILE193 |
| NATEGLINIDE_chembl783 | 10 | -7.524 | 0.746 | ARG156, SER180, ILE193, TYR125, LYS189, GLU191, GLU192 |
| PAROXETINE_chembl490 | 10 | -8.730 | 0.881 | ARG367, ARG146, ARG199, ASP312, TYR364, VAL219, PHE360 |
| dolasetron_dc3931 | 8 | -7.811 | 0.776 | ARG146, GLN335, ALA310, ASP312, PHE360, TYR364 |
| CINOXACIN_chembl1208 | 7 | -7.482 | 0.730 | ARG367, GLN335, SER363, VAL219, ALA310, TYR364 |
| INDOPROFEN_chembl15870 | 7 | -7.543 | 0.737 | GLY145, ALA310, ASP312, VAL219, PHE360, TYR364, ARG199 |
| MINAPRINE_chembl278819 | 7 | -7.900 | 0.789 | GLN335, ARG199, PHE307, ALA310, PHE331, PHE360, TYR364 |
| AGOMELATINE_chembl10878 | 6 | -7.547 | 0.742 | SER217, VAL219, TYR364, PHE360 |
| LEFLUNOMIDE_chembl960 | 6 | -7.791 | 0.760 | ARG367, ASP312, TYR364, ALA310, PHE307 |
| DAPIPRAZOLE_chembl1201216 | 5 | -7.557 | 0.746 | ARG367, ALA310, PHE360, TYR364 |

### Supplementary Table S2. Computational environment and software versions

| Component | Version / value |
| --- | --- |
| Run ID | 20260513T082956Z_full_70f1959a |
| Mode | full |
| Status | completed |
| Config hash | 70f1959a2400901fa0c7ce9e5c8925e20ef7dbeee0a355c80d4cadb102c3b84f |
| Timestamp (UTC) | 20260513T082956Z |
| Python | 3.12.3 |
| Implementation | CPython |
| OS | Linux |
| Platform | Linux-6.6.87.2-microsoft-standard-WSL2-x86_64-with-glibc2.39 |
| Machine | x86_64 |
| Random seed | 42 |
| Command line | python main.py --config configs/config_repurposing.yaml --mode full |
| NumPy | 1.26.4 |
| pandas | 3.0.3 |
| matplotlib | 3.10.9 |
| SciPy | 1.11.4 |
| joblib | 1.5.3 |
| requests | 2.31.0 |
| AutoDock Vina | AutoDock Vina v1.2.5 |
| Open Babel | Open Babel 3.1.1 -- Mar 31 2024 -- 06:39:03 |
| PLIP | 2.3.0+dfsg-2 |
| ProLIF | 2.1.0 |
| MDAnalysis | 2.10.0 |

### Supplementary Table S3. Docking and ranking configuration

| Docking setting | Value |
| --- | --- |
| Exhaustiveness | 8 |
| Number of poses | 9 |
| Energy range | 3 |
| Retry failed jobs | 1 |
| Workers | 2 |
| Vina executable | vina |
| Docking | 0.450 |
| QSAR | 0.250 |
| ADMET | 0.200 |
| Drug-likeness | 0.050 |
| Toxicity | 0.050 |
| Multi-target | 0.100 |

### Supplementary Table S4. Docking boxes

| Receptor | Site | Center | Size | Waters removed | Chains | Note |
| --- | --- | --- | --- | --- | --- | --- |
| 9P3Y | site_1 | 148.302, 138.954, 161.363 | 23.623, 24.344, 28.995 | True | A | Centered on the crystallographic NAG site in the prepared 9P3Y structure. |
| 5E04 | site_1 | -32.715, -15.712, 45.022 | 33.721, 43.327, 40.402 | True | A | Centered on the RNA-binding crevice of chain A using structure-derived residue geometry. |

### Supplementary Table S5. Source library provenance

| Source | Fetched records | Filter scope | Type | Source URL |
| --- | --- | --- | --- | --- |
| ChEMBL | 3127 | max_phase=4 | Small molecule | https://www.ebi.ac.uk/chembl/api/data/molecule.json |
| DrugCentral | 1859 | fda | Approved public compounds | https://drugcentral.org/static/FDA_Approved.csv |
