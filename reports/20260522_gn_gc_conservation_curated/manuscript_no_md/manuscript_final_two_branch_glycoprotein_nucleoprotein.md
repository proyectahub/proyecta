# Two-branch in silico repurposing against Andes orthohantavirus nucleoprotein and Gn/Gc glycoprotein targets integrates docking, conservation mapping, and available molecular dynamics

**Manuscript status:** publication-oriented final draft for author review.  
**Scope boundary:** strictly computational hypothesis generation. Molecular-dynamics results available to date are integrated as a preliminary post-docking stability layer; incomplete systems are explicitly listed. No wet-lab protocol, pathogen manipulation, clinical recommendation, or efficacy claim is provided.

## Abstract
We present a reproducible, publication-oriented in silico drug-repurposing and structural bioinformatics analysis for Andes orthohantavirus targets PDB 9P3Y and PDB 5E04. Approved-source compounds from ChEMBL and DrugCentral were standardized, deduplicated, filtered with RDKit physicochemical and medicinal-chemistry criteria, prioritized using transparent heuristic QSAR/ADMET scoring, and docked with AutoDock Vina. The final screening run assembled 4,986 source records, collapsed them to 3,460 unique ligands, retained 934 after preprocessing, and docked 93 prioritized compounds. The strongest single Vina score was observed for paroxetine against 5E04 (-8.730 kcal/mol), and receptor-wise patterns favored 5E04 over the exploratory 9P3Y glycoprotein-associated pocket. Consensus rescoring, docking-box sensitivity analysis, chemical-diversity analysis, PLIP interaction fingerprints, PyMOL pose rendering, and Gn/Gc conservation mapping were integrated to improve interpretability and publication transparency. Conservation analysis showed stronger conservation in the estimated Gc region than in Gn and provided regional alignment context around the WAASA-like Gn/Gc junction and conserved glycoprotein windows. The study defines a conservative computational shortlist and structural hypotheses for future evaluation. It does not establish antiviral activity, binding affinity, safety, or therapeutic utility.

## Keywords
Andes orthohantavirus; hantavirus; drug repurposing; AutoDock Vina; PLIP; ChEMBL; DrugCentral; Gn/Gc glycoprotein; nucleoprotein; sequence conservation; consensus docking.

## Introduction
Andes orthohantavirus is an important zoonotic pathogen, and structure-guided computational repurposing can help prioritize known small molecules for non-operational downstream review. This manuscript integrates two complementary and explicitly separated target hypotheses: PDB 5E04, an Andes virus nucleoprotein structure with a structurally motivated RNA-proximal pocket prioritized with paroxetine, and PDB 9P3Y, a Gn/Gc glycoprotein-complex-related structure with an exploratory glycan/NAG-associated surface pocket prioritized with granisetron. The aim is not to identify an antiviral drug, but to build a transparent computational prioritization framework that combines docking, ligand curation, interaction annotation, pharmacological context, chemical diversity, and glycoprotein conservation.

The glycoprotein-associated hypothesis is interpreted cautiously. Residues in the predicted paroxetine-associated pocket, including ALA310, PRO311, SER332, ARG199, and GLN335 when present in structural interaction records, have not been experimentally validated as receptor-binding determinants. Because hantavirus membrane fusion is primarily mediated by Gc class II fusion machinery, this pocket is framed as a putative attachment-, spike-stability-, or entry-modulatory surface region rather than a canonical fusion-loop target.


### Two-branch target-candidate design
The computational study was organized as a two-branch prioritization design rather than a single-ligand narrative. The nucleoprotein branch selected paroxetine for PDB 5E04 because it ranked as the strongest receptor-specific candidate in the 5E04 docking/prioritization table. The glycoprotein branch selected granisetron for PDB 9P3Y because it ranked as the strongest receptor-specific candidate for the Gn/Gc glycoprotein-associated pocket. These selections are receptor-specific computational hypotheses and should not be merged into a single target mechanism.

**Table 0. Receptor-specific candidate selection used for MD follow-up.**
| target | selected_ligand | selection_basis | vina_score_kcal_mol | hypothesis | md_status |
| --- | --- | --- | --- | --- | --- |
| 5E04 nucleoprotein | PAROXETINE_chembl490 | top receptor-specific docking/prioritization for 5E04 | -8.73 | nucleoprotein/RNA-proximal pocket hypothesis | existing 43.25 ns analyzable trajectory; 50 ns repeat queued |
| 9P3Y Gn/Gc glycoprotein complex | GRANISETRON_chembl289469 | top receptor-specific docking/prioritization for 9P3Y | -6.523 | exploratory glycan/NAG-associated surface-pocket hypothesis | active/preproduction-progressing at last check; final 50 ns analysis pending |

The resulting interpretation is therefore bifurcated: paroxetine is discussed in relation to a nucleoprotein/RNA-proximal pocket hypothesis, whereas granisetron is discussed in relation to an exploratory Gn/Gc surface-pocket hypothesis. Ribavirin and NAG are included only as computational reference/control systems.

## Materials and Methods
### Reproducible computational workflow
The pipeline used timestamped output directories, fixed random seed control, explicit receptor and ligand configuration, logged external-tool detection, and non-overwriting run bundles. AutoDock Vina, Open Babel, RDKit, PLIP/interaction analysis, matplotlib-based reporting, and MAFFT-based conservation analysis were used where available.

### Ligand collection and curation
Approved-source molecules were collected from ChEMBL and DrugCentral, merged, standardized, and deduplicated by InChIKey. RDKit descriptors included molecular weight, cLogP, TPSA, hydrogen-bond donors/acceptors, rotatable bonds, formal charge, fraction Csp3, aromatic rings, and QED. Lipinski, Veber, PAINS, and BRENK filters were applied conservatively, and rejected ligands were logged.

### Target preparation and docking
PDB 9P3Y and PDB 5E04 were prepared as receptor structures. Docking boxes were explicitly configured and were not inferred or invented by the pipeline. AutoDock Vina docking was performed across the selected receptor/site definitions. Vina scores are reported in kcal/mol as scoring-function outputs and are not interpreted as experimental binding free energies.

### Prioritization, validation, and interaction analysis
No validated Andes-virus QSAR model was supplied; therefore, QSAR prioritization used a transparent heuristic baseline. Rule-based ADMET and off-target flags were used as interpretive risk proxies. Consensus rescoring, control/decoy comparisons, docking-box sensitivity analysis, chemical-diversity analysis, PLIP residue fingerprints, and PyMOL-rendered poses were used to assess internal consistency and structural plausibility.

### Gn/Gc conservation mapping
Representative GPC sequences from Andes, Sin Nombre, Hantaan, Puumala, Seoul, and additional orthohantaviruses were aligned with MAFFT. Conservation, entropy, pairwise identity, estimated Gn/Gc regions, WAASA-like junction mapping, and regional alignments were calculated relative to the Andes reference sequence.

### Molecular dynamics post-docking layer
Molecular dynamics was used as an orthogonal computational follow-up for selected docked complexes when trajectory data were available. The available paroxetine complex trajectory was analyzed for backbone/complex RMSD, ligand RMSD, radius of gyration, protein-ligand hydrogen-bond counts, total protein-ligand contacts, and residue-level contact persistence. These MD descriptors are interpreted as pose-stability and structural-consistency metrics only. They do not establish binding affinity, antiviral activity, or clinical relevance. Systems without completed/analyzable trajectories are reported transparently as pending rather than inferred.

## Results
### Screening throughput and target rationale
| Metric | Value | Interpretation |
| --- | --- | --- |
| Raw fetched ligand records | 4986 | ChEMBL plus DrugCentral before deduplication |
| Unique deduplicated ligands | 3460 | InChIKey-based merge of approved-source records |
| Accepted after preprocessing | 934 | RDKit curation, descriptor and medicinal-chemistry filters |
| Rejected during preprocessing | 2526 | Rejected with recorded reasons |
| Selected for docking | 93 | Top 10% of accepted ligands after heuristic prioritization |
| Vina pose records | 1671 | All receptor/site/pose rows in the archived docking table |


**Table 1. Target rationale and docking-site interpretation.**
| pdb_id | protein_complex_name | virus_or_organism | experimental_method | resolution_angstrom | selected_chain | selected_site | crystallographic_ligands | pocket_rationale | site_limitation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 9P3Y | Andes virus glycoprotein tetramer in complex with ADI-65534 Fab | Andes virus | ELECTRON MICROSCOPY | unavailable | A | site_1 | NAG | Exploratory glycan-associated / NAG-associated pocket suggested by the prepared structure. | EM structure with substantial missing-residue annotations; pocket is exploratory and not validated as dru... |
| 5E04 | Crystal structure of Andes virus nucleoprotein | Andes virus | X-RAY DIFFRACTION | 2.25 | A | site_1 | none | Structurally motivated RNA-binding crevice in the nucleoprotein core region. | X-ray structure is informative but does not represent the complete viral ribonucleoprotein context. |

### Conservation and structural context
| ANDV_region_estimate | n_alignment_columns | mean_identity_percent | median_identity_percent | mean_gap_percent | mean_entropy_norm |
| --- | --- | --- | --- | --- | --- |
| Gc_estimated | 487 | 78.17 | 91.67 | 0.09 | 0.159 |
| Gn_estimated | 651 | 70.06 | 66.67 | 0.35 | 0.224 |

Regional alignments showed conserved windows around the WAASA-like Gn/Gc junction and selected Gn/Gc segments. These conservation features are useful for contextualizing structural hypotheses, but they do not establish druggability or ligand-mediated inhibition.

### Docking and composite prioritization
**Table 2. Top computationally prioritized candidates.**
| rank_position | ligand_id | best_receptor_id | best_docking_score_kcal_mol | best_score__5E04 | best_score__9P3Y | qed | logp | tpsa | composite_score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | PAROXETINE_chembl490 | 50000.0 | -8.73 | -8.73 | -6.001 | 0.934 | 3.327 | 39.72 | 0.8814599665614418 |
| 2 | MINAPRINE_chembl278819 | 50000.0 | -7.9 | -7.9 | -5.883 | 0.917 | 2.196 | 50.28 | 0.7886307999068312 |
| 3 | dolasetron_dc3931 | 50000.0 | -7.811 | -7.811 | -6.18 | 0.862 | 2.519 | 62.4 | 0.7764347241632403 |
| 4 | LEFLUNOMIDE_chembl960 | 50000.0 | -7.791 | -7.791 | -5.632 | 0.911 | 3.254 | 55.13 | 0.7600114808208118 |
| 5 | NATEGLINIDE_chembl783 | 50000.0 | -7.524 | -7.524 | -6.313 | 0.846 | 3.261 | 66.4 | 0.7456857313225832 |
| 6 | DAPIPRAZOLE_chembl1201216 | 50000.0 | -7.557 | -7.557 | -6.148 | 0.864 | 2.288 | 37.19 | 0.7455040715567784 |
| 7 | AGOMELATINE_chembl10878 | 50000.0 | -7.547 | -7.547 | -5.51 | 0.896 | 2.527 | 38.33 | 0.7417516340720293 |
| 8 | INDOPROFEN_chembl15870 | 50000.0 | -7.543 | -7.543 | -5.924 | 0.94 | 3.035 | 57.61 | 0.7369739831235105 |
| 9 | CINOXACIN_chembl1208 | 50000.0 | -7.482 | -7.482 | -5.358 | 0.862 | 0.843 | 90.65 | 0.7295241098563212 |
| 10 | INDAPAMIDE_chembl406 | 50000.0 | -7.351 | -7.351 | -6.343 | 0.871 | 2.083 | 92.5 | 0.7148324456490813 |

Paroxetine ranked first in the archived composite analysis with the strongest single Vina score against 5E04. Other prioritized compounds included minaprine, dolasetron, leflunomide, nateglinide, dapiprazole, agomelatine, indoprofen, cinoxacin, and indapamide. These are computationally prioritized candidates only; prior approval or clinical use does not imply antiviral activity.

### Validation, sensitivity, and consensus rescoring
**Table 3. Docking validation summary.**
| analysis_type | group | ligand_count | mean_best_score | median_best_score | best_score | worst_score | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| docking_validation | control | 3 | NA | NA | NA | NA | Reference/control compounds for computational comparison only |
| docking_validation | decoy | 30 | NA | NA | NA | NA | Background decoys or top-ranked candidates |
| docking_validation | top_hit | 93 | -7.418 | -7.263 | -8.73 | -6.974 | Background decoys or top-ranked candidates |

**Table 4. Consensus ranking summary.**
| consensus_position | ligand_id | receptor_id | vina_score | secondary_score | secondary_tool | rank_stability |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | PAROXETINE_chembl490 | 5E04 | -8.73 | -6.04 | vina_vinardo | 0.0 |
| 2 | LEFLUNOMIDE_chembl960 | 5E04 | -7.791 | -5.819 | vina_vinardo | 0.0 |
| 3 | MINAPRINE_chembl278819 | 5E04 | -7.9 | -5.372 | vina_vinardo | 0.0 |
| 4 | AGOMELATINE_chembl10878 | 5E04 | -7.547 | -5.756 | vina_vinardo | 0.0 |
| 5 | NATEGLINIDE_chembl783 | 5E04 | -7.524 | -6.037 | vina_vinardo | 0.0 |
| 6 | INDOPROFEN_chembl15870 | 5E04 | -7.543 | -5.474 | vina_vinardo | 0.0 |
| 7 | DAPIPRAZOLE_chembl1201216 | 5E04 | -7.557 | -4.958 | vina_vinardo | 0.0 |
| 8 | dolasetron_dc3931 | 5E04 | -7.811 | -4.66 | vina_vinardo | 0.0 |
| 9 | INDAPAMIDE_chembl406 | 5E04 | -7.351 | -5.221 | vina_vinardo | 0.0 |
| 10 | MAVACAMTEN_chembl4297517 | 5E04 | -7.15 | -5.104 | vina_vinardo | 0.0 |

Control and decoy analyses were used as computational references, and docking-box perturbations evaluated sensitivity to site definition. Consensus rescoring improves robustness of the rank ordering but does not estimate true binding free energy.

### Repurposing context and computational ADMET interpretation
**Table 5. Pharmacological context for selected prioritized compounds.**
| ligand_id | approval_status | therapeutic_class_or_indication | best_receptor | best_docking_score_kcal_mol | safety_interpretation_warning |
| --- | --- | --- | --- | --- | --- |
| PAROXETINE_chembl490 | approved | CNS-active SSRI | 50000.0 | -8.73 | CNS-off-target profile may complicate repurposing interpretation. Clinical approval does not imply antivi... |
| MINAPRINE_chembl278819 | approved | Historical CNS-active agent | 50000.0 | -7.9 | Legacy compounds may have limited translational value. Clinical approval does not imply antiviral activit... |
| dolasetron_dc3931 | approved | Antiemetic 5-HT3 antagonist | 50000.0 | -7.811 | Use as a repurposing candidate only in a computational context. Clinical approval does not imply antivira... |
| LEFLUNOMIDE_chembl960 | approved | Immunomodulatory disease-modifying agent | 50000.0 | -7.791 | Immune-modulating pharmacology requires cautious interpretation. Clinical approval does not imply antivir... |
| NATEGLINIDE_chembl783 | approved | Antidiabetic agent | 50000.0 | -7.524 | Metabolic pharmacology should not be overinterpreted as antiviral activity. Clinical approval does not im... |
| DAPIPRAZOLE_chembl1201216 | approved | Ophthalmic alpha-adrenergic antagonist | 50000.0 | -7.557 | Local ophthalmic use limits direct translational inference. Clinical approval does not imply antiviral ac... |
| AGOMELATINE_chembl10878 | approved | Melatonergic antidepressant | 50000.0 | -7.547 | CNS activity warrants cautious interpretation. Clinical approval does not imply antiviral activity; inter... |
| INDOPROFEN_chembl15870 | approved | NSAID | 50000.0 | -7.543 | Anti-inflammatory action does not imply antiviral efficacy. Clinical approval does not imply antiviral ac... |

Clinical approval, therapeutic class, or historical use is included only to support cautious repurposing interpretation. Rule-based ADMET and off-target flags are computational risk signals, not safety conclusions.

### Chemical diversity and interaction fingerprints
The top-hit set was evaluated using Morgan fingerprints, Tanimoto similarity, Bemis-Murcko scaffolds, and residue-level PLIP fingerprints. Recurrent contacts were observed in the docking-pose interaction layer, including residues such as TYR364, TYR125, PHE360, ARG367, and ALA310 in the local residue-frequency table. These contacts support pose consistency within the model but do not confirm binding experimentally.

## Main Figures

### Figure 1. Conservation and regional alignment context
![Conservation and regional alignment context](composite_figures/Figure_1_conservation_context.png)

Gn/Gc sequence-conservation framework. (A) ANDV-referenced rolling conservation profile. (B) Pairwise GPC identity matrix. (C) WAASA-like Gn/Gc junction alignment. (D) Representative conserved Gc window. These panels contextualize docking-pocket hypotheses against cross-orthohantavirus sequence conservation.

### Figure 2. Docking and composite prioritization
![Docking and composite prioritization](composite_figures/Figure_2_docking_prioritization.png)

Structure-based prioritization. (A) Vina score distributions by target. (B) Top-hit receptor score heatmap. (C) Composite score component breakdown. (D) Docking/QSAR/ADMET prioritization space. Scores are computational ranking outputs, not experimental affinities.


### Figure 2B. Receptor-specific two-branch candidate selection
![Receptor-specific two-branch candidate selection](composite_figures/Figure_2b_receptor_specific_selection.png)

Figure 2B. Receptor-specific docking selection supporting the two-branch manuscript logic. (A) Top-ranked candidates for the 5E04 nucleoprotein pocket, where paroxetine was selected for MD follow-up. (B) Top-ranked candidates for the 9P3Y Gn/Gc glycoprotein-associated pocket, where granisetron was selected for MD follow-up. Highlighted bars indicate the branch-specific MD candidates.

### Figure 3. Docking validation, sensitivity and consensus rescoring
![Docking validation, sensitivity and consensus rescoring](composite_figures/Figure_3_validation_consensus.png)

Internal robustness analysis. (A) Candidate/control/decoy score distribution. (B) Docking-box sensitivity heatmap. (C) Consensus scoring heatmap. (D) Consensus-rank comparison. These analyses test prioritization robustness but do not validate biological activity.

### Figure 4. Chemical diversity and computational ADMET context
![Chemical diversity and computational ADMET context](composite_figures/Figure_4_chemical_admet_diversity.png)

Chemical interpretability layer. (A) Chemical-space projection. (B) Top-hit Tanimoto similarity. (C) Bemis-Murcko scaffold frequency. (D) ADMET/off-target risk-flag matrix. These are computational descriptors and risk proxies, not safety conclusions.

### Figure 5. Residue-level interactions and docked-pose inspection
![Residue-level interactions and docked-pose inspection](composite_figures/Figure_5_interactions_pose_gallery.png)

Structural interaction layer. (A) Ligand-residue interaction matrix. (B) Recurrent interaction residues. (C) Interaction-type distribution. (D) PyMOL-rendered docking-pose gallery. Recurrent contacts support pose consistency only within the docking model.

## Discussion
This work provides an integrated computational framework for Andes orthohantavirus repurposing hypotheses. The study is strengthened by approved-source ligand provenance, explicit ligand curation, target-specific docking, consensus and sensitivity analyses, residue-level interaction annotation, chemical-diversity analysis, and independent Gn/Gc conservation context. The strongest global prioritization signal centered on 5E04/paroxetine, but the study design also includes a separate 9P3Y/granisetron glycoprotein branch. The 9P3Y branch is not secondary noise; it is an exploratory glycoprotein-pocket hypothesis that must be interpreted with conservation mapping and pending MD results. The combined results support a focused shortlist for expert review, but they do not establish antiviral efficacy or clinical relevance.

The most publication-relevant point is methodological transparency: each layer answers a different question. Docking ranks pose compatibility under a scoring function; consensus/sensitivity tests assess internal robustness; ADMET flags identify interpretive liabilities; PLIP/PyMOL support structural inspection; and sequence conservation contextualizes whether target-site hypotheses lie in conserved or variable glycoprotein regions. None of these layers independently validates biological activity.

## Limitations
- Docking scores are not experimental affinities or binding free energies.
- Receptors were treated with limited flexibility and do not represent all biological conformational states.
- Scoring-function bias can affect rank ordering, even with consensus rescoring.
- QSAR and ADMET components are heuristic/rule-based unless explicitly labeled otherwise.
- Protonation, tautomeric state, stereochemistry, and ligand preparation assumptions can alter docking results.
- Docking-box selection influences sampled pose space; sensitivity analysis assesses robustness but does not validate druggability.
- The 9P3Y glycan/NAG-associated pocket is exploratory.
- The 5E04 structure does not represent the complete viral ribonucleoprotein assembly.
- Molecular dynamics evidence is currently incomplete: paroxetine/5E04 has an analyzable 43.25 ns trajectory, whereas granisetron/9P3Y and the full 50 ns candidate-control panel remain pending.
- No biochemical, biophysical, cellular, animal, or clinical validation is included.


### Glycoprotein branch: 9P3Y-granisetron hypothesis
The 9P3Y branch addresses the Andes virus Gn/Gc glycoprotein-related structure. Granisetron was selected because it was the top receptor-specific computational candidate for the 9P3Y site in the docking table, with a Vina score of approximately -6.52 kcal/mol. This branch is distinct from the paroxetine/5E04 nucleoprotein hypothesis. The 9P3Y pocket is interpreted as an exploratory glycan- or NAG-associated surface pocket within the glycoprotein architecture, not as a validated fusion-loop target and not as evidence of antiviral activity.

The Gn/Gc conservation analysis enriches this branch by showing that glycoprotein regions are not uniformly conserved across representative orthohantaviruses. Therefore, any 9P3Y ligand hypothesis must be interpreted in the context of local sequence conservation, surface exposure, glycan-associated structure, and the fact that Gc-mediated membrane fusion involves class II fusion machinery. Granisetron should be described only as a putative in silico repurposing candidate for the exploratory 9P3Y pocket pending completion of the queued/active MD analysis and independent validation.

## Molecular dynamics results available to date
The remote GROMACS portal contained several preproduction or partial jobs. At the time of manuscript assembly, one trajectory had complete exported analysis suitable for integration: the 5E04-paroxetine nucleoprotein-branch complex. The 9P3Y-granisetron glycoprotein-branch simulation was detected as active/in progress and is therefore described as pending rather than analyzed. The analyzed paroxetine trajectory spans 43.25 ns. Because the intended target length was 50 ns and the corresponding portal job was marked as interrupted/failed with code -15, these data are reported as available-to-date post-docking evidence rather than a finalized production result. The principal interpretation is that the paroxetine pose retained recurrent protein-ligand contacts during the available trajectory window, while full candidate-control comparison remains pending until the missing systems complete.

**Table 6. Paroxetine MD summary metrics available to date.**
| file | n_points | x_time_unit | time_ns_max | mean | median | sd | min | max | last | value_unit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| paroxetine_rmsd.xvg | 8651 | ns | 43.2500038 | 0.2554286441451855 | 0.2543734 | 0.0335676883757591 | 0.0005024 | 0.376934 | 0.2737007 | nm |
| paroxetine_rmsd_ligand.xvg | 8651 | ns | 43.2500038 | 2.3001627473586868 | 0.1790594 | 3.978956192599423 | 0.0004907 | 10.1646261 | 0.397361 | nm |
| paroxetine_gyrate.xvg | 8651 | ps | 43.25 | 2.0692471522367355 | 2.068687 | 0.0118609329119895 | 2.030262 | 2.111146 | 2.065056 | nm |
| paroxetine_pl_contacts.xvg | 347 | ns | 43.25 | 15.861671469740632 | 16.0 | 6.786453744301793 | 2.0 | 36.0 | 15.0 | contacts |
| paroxetine_pl_hbonds.xvg | 8651 | ps | 43.25 | 0.0261241474973991 | 0.0 | 0.159513691102679 | 0.0 | 1.0 | 0.0 | H-bonds |


**Table 7. Recurrent paroxetine contact residues from the available trajectory.**
| residue | interaction | total_contacts | mean_contacts | frames_present | interaction_fraction |
| --- | --- | --- | --- | --- | --- |
| ALA310 | Hydrophobic | 918 | 3.5307692307692307 | 260 | 2.645533141210375 |
| PRO311 | Hydrophobic | 646 | 2.503875968992248 | 258 | 1.861671469740634 |
| SER332 | H-bonds | 481 | 2.1963470319634704 | 219 | 1.3861671469740633 |
| SER142 | H-bonds | 480 | 2.9447852760736195 | 163 | 1.38328530259366 |
| ARG199 | Ionic | 406 | 2.00990099009901 | 202 | 1.170028818443804 |
| GLN335 | H-bonds | 398 | 1.9134615384615383 | 208 | 1.1469740634005765 |
| SER217 | H-bonds | 258 | 1.7551020408163265 | 147 | 0.7435158501440923 |
| ASP312 | Ionic | 253 | 1.946153846153846 | 130 | 0.729106628242075 |
| PHE360 | Hydrophobic | 230 | 1.6546762589928057 | 139 | 0.6628242074927954 |
| TYR364 | H-bonds | 220 | 1.3095238095238095 | 168 | 0.6340057636887608 |
| GLY145 | Hydrophobic | 212 | 2.07843137254902 | 102 | 0.6109510086455331 |
| PHE307 | Hydrophobic | 166 | 1.456140350877193 | 114 | 0.4783861671469741 |


### Remote MD job status and required simulations to close the paper
The current MD evidence is incomplete for a full candidate-control manuscript claim. The following systems are required to close the MD section with balanced candidate and control comparisons.


**Table 10. Interpretable status of existing MD jobs.**

| Category | Systems detected | Interpretation for manuscript |
|---|---|---|
| Completed preproduction / short jobs | paroxetina/paroxetina003 jobs with production_done=True | Useful as setup evidence, but not used as final comparative 50 ns MD evidence unless trajectory analysis is present. |
| Existing analyzable trajectory | paroxetine complex, 43.25 ns exported trajectory | Integrated as available-to-date MD stability/contact evidence. |
| Active MD | 9P3Y-granisetron | Running or equilibrating; not yet integrated as a result. |
| Queued MD | 5E04-ribavirin, 5E04-paroxetine repeat, 9P3Y-NAG | Required to close balanced candidate-control MD section. |

**Table 8. Remote MD job status.**
| job_id | status | progress | started_at | finished_at | reusable_stage | production_done | analysis_png | analysis_csv | message |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 20260519-000913-paroxetina | failed | 87.5 | 2026-05-19T06:09:13+00:00 | 2026-05-19T18:00:58+00:00 | nvt | False | 5 | 24 | El proceso termino con codigo -15 |
| 20260522-110429-gromacs-projectgranisetron | equilibrating_npt | 87.5 | 2026-05-22T17:04:29+00:00 | NA | nvt | False | 0 | 0 | NA |
| 20260522-110437-gromacs-projectgranisetron | queued | 0.0 | NA | NA | NA | False | 0 | 0 | En cola de ejecución. Posición 1. Esperando a que termine el job activo. |
| 20260516-164007-gromacs-projectparoxetina003 | completed | 100.0 | 2026-05-16T22:40:07+00:00 | 2026-05-16T22:48:45+00:00 | npt_final | True | 16 | 24 | Ejecucion completada |
| 20260521-225331-paroxetina | completed | 100.0 | 2026-05-22T04:53:31+00:00 | 2026-05-22T07:22:10+00:00 | npt_final | True | 0 | 0 | Ejecucion completada |
| 20260521-225345-paroxetina | failed | 87.5 | 2026-05-22T07:22:12+00:00 | 2026-05-22T16:26:18+00:00 | nvt | False | 0 | 0 | El proceso ya no estaba activo al consultar el job; pero dejo artefactos reutilizables hasta NPT. |


**Table 9. MD simulations required before final submission.**
| system | role | current_status | required_to_close_manuscript |
| --- | --- | --- | --- |
| 5E04-Paroxetine candidate | candidate | partially analyzable / interrupted long run | Has contact/RMSD/Rg/H-bond analysis through available trajectory; repeat/complete 50 ns production recommended for ... |
| 9P3Y-Granisetron candidate | candidate | active/preproduction or queued | Finish 50 ns production, then analyze RMSD, ligand RMSD, RMSF, Rg, H-bonds and contacts. |
| 5E04-Ribavirin reference control | computational antiviral reference control | not found as completed production in current portal search | Run same 50 ns protocol and report as reference/control only, not positive control. |
| 9P3Y-NAG structural control | structural/redocking control | not found as completed production in current portal search | Run same 50 ns protocol if chemically and parametrically valid; otherwise mark not applicable. |


### Figure 6. Existing MD trajectory diagnostics for paroxetine
![Existing MD trajectory diagnostics for paroxetine](composite_figures/Figure_6_MD_existing_simple_panels.png)

Figure 6. Existing analyzable molecular-dynamics trajectory for the paroxetine complex. (A) Backbone RMSD. (B) Ligand RMSD. (C) Radius of gyration. (D) Total protein-ligand contacts. Dashed horizontal lines indicate trajectory means. The available trajectory spans 43.25 ns and is therefore treated as available-to-date computational evidence rather than a complete 50 ns final production result.

### Figure 7. Existing MD contact persistence for paroxetine
![Existing MD contact persistence for paroxetine](composite_figures/Figure_7_MD_existing_contacts_simple.png)

Figure 7. Protein-ligand contact persistence from the existing paroxetine trajectory. (A) Contact time series and residue-level contact heatmap exported from the GROMACS analysis workflow. (B) Most recurrent contact residues summarized by total contacts. These contacts support pose-level consistency within the simulation model but do not establish binding affinity or antiviral activity.

## Data and supplementary material
The main manuscript uses six composite figures and core tables; complete machine-readable tables are provided as supplementary material. Full-resolution source figures, complete docking tables, residue-interaction matrices, conservation outputs, ADMET profiles, and ranking tables are provided as supplementary material in the local manuscript package.

### Supplementary tables included
| Supplementary file | Source table |
| --- | --- |
| selected_gpc_sequences.csv | selected_gpc_sequences.csv |
| pairwise_identity_percent.csv | pairwise_identity_percent.csv |
| region_conservation_summary.csv | region_conservation_summary.csv |
| regional_alignment_summary.csv | regional_alignment_summary.csv |
| andv_referenced_conservation.csv | andv_referenced_conservation.csv |
| top_hits.csv | top_hits.csv |
| receptor_rankings.csv | receptor_rankings.csv |
| vina_docking_results.csv | vina_docking_results.csv |
| pharmacological_plausibility_table.csv | pharmacological_plausibility_table.csv |
| docking_validation_summary.csv | docking_validation_summary.csv |
| docking_box_sensitivity_summary.csv | docking_box_sensitivity_summary.csv |
| consensus_rankings.csv | consensus_rankings.csv |
| expanded_admet_profile.csv | expanded_admet_profile.csv |
| risk_flag_summary.csv | risk_flag_summary.csv |
| scaffold_summary.csv | scaffold_summary.csv |
| top_hit_tanimoto_matrix.csv | top_hit_tanimoto_matrix.csv |
| ligand_residue_interaction_matrix.csv | ligand_residue_interaction_matrix.csv |
| residue_frequency.csv | residue_frequency.csv |
