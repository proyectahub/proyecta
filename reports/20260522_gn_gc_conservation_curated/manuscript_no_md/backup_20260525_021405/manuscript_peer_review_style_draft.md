# In silico drug-repurposing prioritization against Andes orthohantavirus nucleoprotein and Gn/Gc glycoprotein structural targets

## Abstract
A reproducible computational drug-repurposing workflow was applied to two Andes orthohantavirus protein structures: the nucleoprotein structure PDB 5E04 and the Gn/Gc glycoprotein-complex structure PDB 9P3Y. Approved-source compounds from ChEMBL and DrugCentral were standardized, deduplicated, filtered with RDKit-based physicochemical and medicinal-chemistry criteria, prioritized using transparent heuristic QSAR/ADMET scoring, and docked with AutoDock Vina. The final archived screening run assembled 4,986 source records, collapsed them to 3,460 unique ligands, retained 934 after preprocessing, and docked 93 prioritized compounds. Target-level context was assessed before docking: 5E04 was characterized using receptor-intrinsic structural parameters, whereas 9P3Y was contextualized through Gn/Gc conservation and regional alignment analyses across representative orthohantaviruses. The strongest global Vina score was obtained for paroxetine against 5E04 (-8.730 kcal/mol). The 9P3Y receptor-specific ranking prioritized granisetron for the glycoprotein-associated exploratory pocket (-6.523 kcal/mol). Interaction annotation, PyMOL receptor and pose visualization, rule-based ADMET profiling, chemical-diversity analysis, and available molecular-dynamics descriptors were used to support conservative structural interpretation. These results define computational hypotheses for potential antiviral-strategy evaluation for downstream evaluation. The analyses did not establish antiviral activity, binding affinity, safety, or therapeutic efficacy.

## Introduction

The central objective was to prioritize receptor-specific ligand hypotheses that could inform future antiviral-strategy development against Andes orthohantavirus protein targets. The term antiviral strategy is used here in a computational and hypothesis-generating sense: it refers to prioritization of protein-ligand models for subsequent non-computational evaluation, not to demonstrated antiviral efficacy.

Andes orthohantavirus is an important zoonotic pathogen, and structure-guided computational repurposing can help prioritize known small molecules for non-operational downstream review. This study integrates two complementary and explicitly separated target hypotheses: PDB 5E04, an Andes virus nucleoprotein structure with a structurally motivated RNA-proximal pocket prioritized with paroxetine, and PDB 9P3Y, a Gn/Gc glycoprotein-complex-related structure with an exploratory glycan/NAG-associated surface pocket prioritized with granisetron. The aim was to generate structurally grounded, experimentally testable computational hypotheses for potential antiviral intervention strategies through an integrated framework combining target selection, ligand curation, docking, interaction annotation, pharmacological context, chemical diversity, and glycoprotein conservation.

The glycoprotein-associated hypothesis is interpreted cautiously. Residues in the predicted granisetron-associated 9P3Y glycoprotein pocket are interpreted separately from the paroxetine/5E04 nucleoprotein pocket. Residue labels are restricted to residues observed in the local structural-interaction or PyMOL proximity records and are not presented as experimentally validated receptor-binding determinants. Because hantavirus membrane fusion is primarily mediated by Gc class II fusion machinery, this pocket is framed as a putative attachment-, spike-stability-, or entry-modulatory surface region rather than a canonical fusion-loop target.


### Two-branch target-candidate design
The computational study was organized as a two-branch prioritization design rather than a single-ligand narrative. The nucleoprotein branch selected paroxetine for PDB 5E04 because it ranked as the strongest receptor-specific candidate in the 5E04 docking/prioritization table. The glycoprotein branch selected granisetron for PDB 9P3Y because it ranked as the strongest receptor-specific candidate for the Gn/Gc glycoprotein-associated pocket. These selections are receptor-specific computational hypotheses and were treated as distinct target-specific hypotheses.


The resulting interpretation is therefore bifurcated: paroxetine is discussed in relation to a nucleoprotein/RNA-proximal pocket hypothesis, whereas granisetron is discussed in relation to an exploratory Gn/Gc surface-pocket hypothesis. Ribavirin and NAG are included only as computational reference/control systems.


### Analytical workflow
The analysis followed a target-first computational workflow. First, the two viral protein structures were selected and characterized as independent modeling targets: PDB 5E04 as an Andes virus nucleoprotein structure and PDB 9P3Y as an Andes virus Gn/Gc glycoprotein-complex structure. Second, target-level context was evaluated before ligand docking. For 5E04, receptor-intrinsic structural parameters were computed directly from the prepared receptor file. For 9P3Y, glycoprotein-specific Gn/Gc conservation and regional alignment analyses were used to contextualize the exploratory surface-pocket hypothesis. Third, an approved-source repurposing library was curated, filtered, and prioritized before docking. Fourth, AutoDock Vina docking, receptor-specific ranking, interaction analysis, and PyMOL pose inspection were used to define candidate structural hypotheses. Finally, molecular dynamics was used only as a downstream computational follow-up for selected docked complexes when trajectories were available.

This ordering was used to preserve a clear distinction between target-level evidence and ligand-level prioritization. Conservation and alignment analyses are placed before docking because they describe target biology and structural context rather than ligand performance. They are used to frame the 9P3Y glycoprotein hypothesis and are not interpreted as evidence of ligandability, inhibition, or antiviral activity. Likewise, 5E04 is not evaluated with Gn/Gc conservation metrics because it is a nucleoprotein target; its structural context is described with receptor-derived parameters and nucleoprotein-pocket rationale.

## Materials and methods


### Computational workflow and reproducibility
The pipeline used timestamped output directories, fixed random seed control, explicit receptor and ligand configuration, logged external-tool detection, and non-overwriting run bundles. AutoDock Vina, Open Babel, RDKit, PLIP/interaction analysis, matplotlib-based reporting, and MAFFT-based conservation analysis were used where available.


### Target selection, receptor preparation, and pre-docking structural context
PDB 5E04 and PDB 9P3Y were selected as complementary Andes orthohantavirus protein targets for computational prioritization. 5E04 represents the nucleoprotein branch and was interpreted through a structurally motivated nucleoprotein pocket hypothesis. 9P3Y represents the Gn/Gc glycoprotein-complex branch and was interpreted as an exploratory glycan/NAG-associated surface-pocket hypothesis. Receptor structures were prepared before docking, and ligand-specific interpretations were not assigned until after docking and pose analysis.

Before ligand docking, target-level analyses were performed to separate protein context from ligand ranking. For 5E04, receptor-intrinsic parameters, including residue count, atom count, selected chain, and approximate Cartesian span, were computed directly from the prepared receptor PDB. For 9P3Y, Gn/Gc conservation analysis and regional alignments were used to contextualize glycoprotein-domain conservation across representative orthohantaviruses. This conservation analysis applies to the glycoprotein branch only and does not apply to the 5E04 nucleoprotein target.

### Approved-source ligand collection and curation
Approved-source molecules were collected from ChEMBL and DrugCentral, merged, standardized, and deduplicated by InChIKey. RDKit descriptors included molecular weight, cLogP, TPSA, hydrogen-bond donors/acceptors, rotatable bonds, formal charge, fraction Csp3, aromatic rings, and QED. Lipinski, Veber, PAINS, and BRENK filters were applied conservatively, and rejected ligands were logged.

### Target preparation, docking, and branch-level redocking controls
PDB 9P3Y and PDB 5E04 were prepared as receptor structures. Docking boxes were explicitly configured and were not inferred or invented by the pipeline. The primary virtual-screening pass used AutoDock Vina with exhaustiveness 8 for the 93 prefiltered ligands across the configured receptor/site definitions. This exhaustiveness value was retained for the screening stage to keep the receptor-wise comparison internally consistent and computationally tractable.

After receptor-wise candidate selection, all Top 10 compounds in each branch were subjected to a higher-exhaustiveness check using AutoDock Vina exhaustiveness 16. The resulting top poses were also evaluated with a Vinardo score-only rescoring step where available. This two-tier strategy separates the primary screen from a more stringent local redocking check for the selected branch representatives. Vina and Vinardo scores are reported in kcal/mol as scoring-function outputs and are not interpreted as experimental binding free energies.

Reference/control docking was included for computational comparison only. The implemented control set includes antiviral-reference compounds such as remdesivir, ribavirin, and favipiravir, together with the NAG structural/redocking control for the 9P3Y glycan-associated context when chemically applicable. Additional controls planned for the final comparative layer include completed apo-receptor simulations for 5E04 and 9P3Y and matched structural-control trajectories. These controls are intended to contextualize ranking robustness and structural behavior; they are not positive controls for Andes virus efficacy.

### Prioritization, validation, and interaction analysis
No validated Andes-virus QSAR model was supplied; therefore, QSAR prioritization used a transparent heuristic baseline. Candidate selection was not based on Vina score alone. The integrated prioritization combined receptor-specific docking rank, global composite score, QED, cLogP, TPSA, heuristic QSAR priority, rule-based ADMET score, medicinal-chemistry filters, toxicity penalties, receptor-coverage behavior, chemical-diversity context, and downstream structural inspection. Consensus rescoring, control/decoy comparisons, docking-box sensitivity analysis, chemical-space projection, PLIP residue fingerprints, and PyMOL-rendered poses were used to assess internal consistency and structural plausibility. These layers are computational prioritization criteria and are not evidence of antiviral activity.

### Gn/Gc conservation mapping
Representative GPC sequences from Andes, Sin Nombre, Hantaan, Puumala, Seoul, and additional orthohantaviruses were aligned with MAFFT. Conservation, entropy, pairwise identity, estimated Gn/Gc regions, WAASA-like junction mapping, and regional alignments were calculated relative to the Andes reference sequence.

### Molecular dynamics post-docking layer
Molecular dynamics was used as an orthogonal computational follow-up for selected docked complexes when trajectory data were available. Available trajectories were analyzed for RMSD and radius-of-gyration descriptors; protein-ligand contact analyses were included only where topology-compatible outputs were available. These MD descriptors are interpreted as pose-stability and structural-consistency metrics only. They did not establish binding affinity, antiviral activity, or clinical relevance. Systems without completed/analyzable trajectories are reported transparently rather than inferred.

## Results

The Results are organized according to the analytical sequence used in the workflow: study design, ligand-library curation, target-specific structural context, docking prioritization, pose/interactions, validation/rescoring, chemical interpretability, and molecular-dynamics follow-up where trajectory data are available. This order avoids mixing target-level structural evidence with ligand-ranking outputs.

### Figure 1. Structural receptor context and pre-docking ligand-library reduction
![Structural receptor context and pre-docking ligand-library reduction](composite_figures/Figure_1_integrated_target_context_and_funnel.png)

Figure 1. Integrated pre-docking overview of receptor context and ligand-input reduction. (A) PDB 5E04 nucleoprotein receptor context, showing an approximate pocket-proximity region selected for structural inspection before docking. This region is described as a nucleoprotein surface/crevice hypothesis and is summarized with receptor-derived descriptors, including residue count, atom count, and approximate Cartesian span from the prepared 5E04 receptor. (B) PDB 9P3Y Gn/Gc glycoprotein-complex receptor context, showing an exploratory glycan/NAG-associated surface region selected for structural inspection before docking. This region is interpreted as a surface-pocket hypothesis within the glycoprotein-complex architecture and not as a validated fusion-loop or receptor-binding determinant. (C) Pre-docking approved-source ligand filtering funnel. The schematic summarizes ligand-library throughput: 4,986 source records were reduced to 3,460 unique ligands, 934 compounds were retained after RDKit-based preprocessing and medicinal-chemistry filtering, and 93 prioritized ligands were selected for docking. No ligand-specific assignments, docking scores, or candidate selections are shown at this stage.

The 5E04 branch was described through receptor-derived structural parameters and local nucleoprotein pocket annotations. The 9P3Y branch was described through glycoprotein-specific structural context and an exploratory surface-region annotation. The integrated funnel defines the ligand input set before target-specific docking scores and candidate assignments are introduced. These pre-docking annotations are used to organize the subsequent screening workflow; they do not establish ligandability, antiviral activity, experimental binding, or therapeutic relevance.

## Docking and composite prioritization

Target-wise docking rankings were generated before selecting representative candidates for downstream structural follow-up. Compounds were first ranked within each receptor using the best AutoDock Vina score observed in the primary exhaustiveness-8 screening pass and were annotated with physicochemical and heuristic prioritization metrics. All receptor-wise Top 10 compounds were then redocked at exhaustiveness 16 and score-only rescored with Vinardo as an orthogonal local check; antiviral-reference and structural controls were processed in the same redocking/rescoring layer when valid prepared ligand files were available. This target-wise presentation prevents the stronger 5E04 score distribution from masking the 9P3Y glycoprotein branch while making explicit that candidate selection was not based on Vina score alone.

### Figure 2. Target-wise Vina score distribution
![Target-wise Vina score distribution](composite_figures/Figure_2_vina_score_distribution.png)

Figure 2. Target-wise docking-score distributions before candidate selection. The histogram summarizes the receptor-specific Top 10 Vina scores reported in Table 1 for 5E04 and 9P3Y. Dashed vertical lines indicate the strongest score within each receptor-specific ranking. Scores are AutoDock Vina scoring-function outputs used for computational prioritization; they are not experimental affinities or binding free energies.

**Table 1. Target-wise Top 10 docking and composite-prioritization results with full redocking and control checks.**

| target | rank | ligand | group | primary Vina exh. 8 | redocking Vina exh. 16 | Vinardo pose rescore | QED | cLogP | TPSA | composite |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5E04 | 1 | PAROXETINE | top10 | -8.730 | -8.887 | -6.097 | 0.934 | 3.327 | 39.720 | 0.881 |
| 5E04 | 2 | MINAPRINE | top10 | -7.900 | -7.949 | -5.063 | 0.917 | 2.196 | 50.280 | 0.789 |
| 5E04 | 3 | DOLASETRON | top10 | -7.811 | -7.811 | -4.660 | 0.862 | 2.519 | 62.400 | 0.776 |
| 5E04 | 4 | LEFLUNOMIDE | top10 | -7.791 | -7.808 | -5.815 | 0.911 | 3.254 | 55.130 | 0.760 |
| 5E04 | 5 | DAPIPRAZOLE | top10 | -7.557 | -7.543 | -4.877 | 0.864 | 2.288 | 37.190 | 0.746 |
| 5E04 | 6 | AGOMELATINE | top10 | -7.547 | -7.548 | -6.022 | 0.896 | 2.527 | 38.330 | 0.742 |
| 5E04 | 7 | INDOPROFEN | top10 | -7.543 | -7.559 | -5.529 | 0.940 | 3.035 | 57.610 | 0.737 |
| 5E04 | 8 | NATEGLINIDE | top10 | -7.524 | -7.508 | -5.956 | 0.846 | 3.261 | 66.400 | 0.746 |
| 5E04 | 9 | CINOXACIN | top10 | -7.482 | -7.482 | -4.931 | 0.862 | 0.843 | 90.650 | 0.730 |
| 5E04 | 10 | INDAPAMIDE | top10 | -7.351 | -7.351 | -5.221 | 0.871 | 2.083 | 92.500 | 0.715 |
| 5E04 | control | FAVIPIRAVIR | control | control redocking only | -5.909 | -4.295 | 0.548 | -0.992 | 88.840 | control |
| 5E04 | control | REMDESIVIR | control | control redocking only | -7.395 | -4.784 | 0.164 | 2.312 | 203.550 | control |
| 5E04 | control | RIBAVIRIN | control | control redocking only | -6.158 | -3.651 | 0.443 | -3.011 | 143.720 | control |
| 9P3Y | 1 | GRANISETRON | top10 | -6.523 | -6.523 | -3.995 | 0.926 | 2.318 | 50.160 | 0.662 |
| 9P3Y | 2 | GREPAFLOXACIN | top10 | -6.472 | -6.472 | -4.338 | 0.880 | 2.280 | 74.570 | 0.650 |
| 9P3Y | 3 | NALTREXONE | top10 | -6.446 | -6.446 | -4.256 | 0.854 | 1.525 | 70.000 | 0.654 |
| 9P3Y | 4 | LEVOFLOXACIN | top10 | -6.368 | -6.368 | -4.068 | 0.875 | 1.544 | 75.010 | 0.681 |
| 9P3Y | 5 | INDAPAMIDE | top10 | -6.343 | -6.351 | -4.171 | 0.871 | 2.083 | 92.500 | 0.715 |
| 9P3Y | 6 | NATEGLINIDE | top10 | -6.313 | -6.313 | -4.594 | 0.846 | 3.261 | 66.400 | 0.746 |
| 9P3Y | 7 | BELZUTIFAN | top10 | -6.208 | -6.208 | -3.867 | 0.879 | 3.289 | 87.390 | 0.640 |
| 9P3Y | 8 | DOLASETRON | top10 | -6.180 | -6.18 | -3.693 | 0.862 | 2.519 | 62.400 | 0.776 |
| 9P3Y | 9 | DAPIPRAZOLE | top10 | -6.148 | -6.148 | -4.007 | 0.864 | 2.288 | 37.190 | 0.746 |
| 9P3Y | 10 | LOMEFLOXACIN | top10 | -6.133 | -6.133 | -3.890 | 0.882 | 1.796 | 74.570 | 0.658 |
| 9P3Y | control | FAVIPIRAVIR | control | control redocking only | -4.633 | -3.146 | 0.548 | -0.992 | 88.840 | control |
| 9P3Y | control | NAG | structural_control | control redocking only | -4.494 | -3.117 | 0.403 | -2.396 | 99.020 | control |
| 9P3Y | control | REMDESIVIR | control | control redocking only | -6.106 | -3.855 | 0.164 | 2.312 | 203.550 | control |
| 9P3Y | control | RIBAVIRIN | control | control redocking only | -5.281 | -4.095 | 0.443 | -3.011 | 143.720 | control |

The primary Vina column reports receptor-wise screening scores obtained with exhaustiveness 8 for the ranked library compounds. All Top 10 compounds in each receptor branch were subsequently redocked with Vina exhaustiveness 16 and rescored using the Vinardo score-only mode applied to the first returned pose. Control rows report computational reference compounds or the 9P3Y NAG structural redocking control; these controls were not part of the ranked repurposing library and therefore are labeled as control entries rather than assigned composite ranks. Scores are scoring-function outputs and are not experimental binding free energies.

### Figure 3. Top-10 branch-level physicochemical and rule-based prioritization context
![Top-10 branch-level physicochemical and rule-based prioritization context](composite_figures/Figure_3_top10_branch_prioritization_context.png)

Figure 3. Branch-level descriptor and rescoring context derived from the receptor-wise Top 10 entries in Table 1. Box-and-point distributions summarize Vina redocking at exhaustiveness 16, Vinardo pose rescoring, QED, cLogP, TPSA, and composite score for the 5E04 and 9P3Y Top 10 groups. Stars indicate the branch representatives selected in Table 2: paroxetine for 5E04 and granisetron for 9P3Y. The figure intentionally aggregates Table 1 rather than repeating the table row-by-row; it shows whether the selected representatives sit within or outside their receptor-specific chemical/prioritization neighborhoods. These are computational descriptors and risk proxies, not safety conclusions.

**Table 2. Receptor-branch candidate selection and orthogonal docking checks.**

| target branch | protein / structural hypothesis | candidate selected for branch | selection basis | additional docking check available | interpretation boundary |
| --- | --- | --- | --- | --- | --- |
| Nucleoprotein branch | PDB 5E04; RNA-proximal nucleoprotein pocket hypothesis | PAROXETINE_chembl490 | selected by the integrated ranking: receptor-specific Vina score, global composite score, QED, cLogP/TPSA profile, heuristic QSAR priority, rule-based ADMET score, medicinal-chemistry filters, and receptor-coverage behavior | branch redocking at exhaustiveness 16: -8.887 kcal/mol; Vinardo score-only rescoring of the docked pose: -6.097; docking-box sensitivity mean for paroxetine/5E04: -7.781 +/- 0.860 kcal/mol across 72 perturbed-box pose records; antiviral-reference comparator redocking scores: remdesivir -7.395, ribavirin -6.158, favipiravir -5.909 kcal/mol | secondary scoring and comparator docking support computational prioritization only; they do not establish binding affinity, antiviral activity, or safety |
| Glycoprotein branch | PDB 9P3Y; exploratory glycan/NAG-associated Gn/Gc surface-pocket hypothesis | GRANISETRON_chembl289469 | selected by the integrated receptor-branch ranking: 9P3Y-specific Vina rank, QED, cLogP/TPSA profile, heuristic QSAR/ADMET context, medicinal-chemistry filters, and separation from the 5E04-dominated global score distribution | branch redocking at exhaustiveness 16: -6.523 kcal/mol; Vinardo score-only rescoring of the docked pose: -3.995; comparator redocking ranked granisetron -6.523, remdesivir -6.106, ribavirin -5.281, NAG structural redocking control -4.494, and favipiravir -4.633 kcal/mol | the glycoprotein pocket is exploratory; control/redocking values contextualize the screen but do not validate druggability or entry inhibition |

Paroxetine represented the strongest global and 5E04-specific integrated-prioritization signal in the archived run. Granisetron was retained separately because it ranked first within the 9P3Y receptor-specific list after the same curation and descriptor framework, even though the global composite ranking was dominated by stronger 5E04 scores. The additional docking checks were used to contextualize rank stability and reference-ligand behavior without repeating the primary target-wise ranking in Table 1.

### Validation, sensitivity, and consensus rescoring

The validation and consensus outputs are retained as supplementary tables and summarized in the robustness figures below. The docking-validation summary included reference/control, decoy, and top-hit groups; however, the available control and decoy rows did not contain completed score statistics in the archived table and therefore are not retained as a main-text table. The top-hit group produced a mean best score of -7.418 kcal/mol, a median best score of -7.263 kcal/mol, a best score of -8.730 kcal/mol, and a weakest score of -6.974 kcal/mol within the analyzed subset.

Secondary checks were extended for the two receptor-branch leads by rerunning branch docking with exhaustiveness 16 and scoring the resulting top poses with the Vinardo scoring function. This produced a matched receptor-wise check for the Top 10 compounds in both branches, including paroxetine/5E04 and granisetron/9P3Y, while the larger consensus-ranking table remains supplementary because it was generated for the 5E04-enriched top-pose set. Reference/control docking was used to contextualize the antiviral-reference compounds and the NAG structural control, and the molecular-dynamics queue includes apo-receptor controls for both targets. Consensus, redocking, and control outputs can support rank-order robustness, but they do not estimate true binding free energy or establish biological activity.

### Repurposing and computational ADMET context

The prioritized compounds were interpreted within a drug-repurposing framework rather than as de novo antiviral leads. Paroxetine and granisetron were selected as branch-specific computational candidates after integration of receptor-specific docking rank, composite prioritization, physicochemical descriptors, heuristic QSAR scoring, rule-based ADMET profiling, medicinal-chemistry filters, chemical-diversity context, and structural follow-up checks. Their prior clinical or database status was used only to contextualize repurposing plausibility.

Paroxetine was annotated locally as an approved CNS-active SSRI, which supports repurposing relevance but also introduces off-target and CNS-pharmacology considerations. Granisetron was retained as the 9P3Y glycoprotein-branch candidate based on receptor-specific prioritization; its interpretation remains restricted to the exploratory glycoprotein-pocket hypothesis. Therapeutic class, approval status, or historical use did not imply antiviral activity. Rule-based ADMET and off-target flags were treated as computational risk indicators, not as safety conclusions. Complete pharmacological plausibility and expanded ADMET profiles are provided as supplementary machine-readable tables.

To avoid duplicating Table 2, the physicochemical and ADMET context was summarized at the branch level rather than restating the full candidate-selection rationale. The receptor-wise Top 10 distributions showed broadly drug-like descriptor ranges in both branches, with median QED values of 0.884 for 5E04 and 0.873 for 9P3Y. The 5E04 Top 10 had a median cLogP of 2.523 and median TPSA of 56.37 A2, whereas the 9P3Y Top 10 had a median cLogP of 2.284 and median TPSA of 72.29 A2. These group-level summaries indicate that the selected branch representatives were not evaluated as isolated single compounds, but as members of receptor-specific prioritized chemical neighborhoods. The descriptors remain computational filters and do not establish safety, exposure, or antiviral activity.

### Chemical diversity and interaction fingerprints
The top-hit set was evaluated using Morgan fingerprints, Tanimoto similarity, Bemis-Murcko scaffolds, and residue-level PLIP fingerprints. A two-dimensional chemical-space projection based on molecular fingerprints/descriptors was generated to verify that candidate selection was not driven by a single scoring column alone; the projection is reported with the chemical-diversity figure and retained with the supplementary chemical-space outputs. Recurrent contacts were observed in the docking-pose interaction layer, including residues such as TYR364, TYR125, PHE360, ARG367, and ALA310 in the local residue-frequency table. These contacts support pose consistency within the model but do not confirm binding experimentally.

## Structural and prioritization figures

**Figure interpretation.** Candidate-specific structural figures are interpreted after the Table 1-to-Table 2 prioritization bridge by target branch: paroxetine is assigned to the 5E04 nucleoprotein branch, whereas granisetron is assigned to the 9P3Y Gn/Gc glycoprotein branch. Molecular-dynamics metrics are reported only where completed or analyzable trajectories are available.

### Structural docking pose visualization by PyMOL
To avoid mixing the nucleoprotein and glycoprotein hypotheses, docking-pose visualization was separated by target. For each target, one PyMOL figure shows the global docked pose in the protein context and one zoom panel shows the predicted local pocket environment. Labels were regenerated as external callouts rather than embedded 3D text to improve readability and avoid overlap with helices, surfaces, and ligand sticks.

### Figure 4. Two-branch PyMOL docking-pose gallery
![Two-branch PyMOL docking-pose gallery](composite_figures/Figure_3_two_branch_pymol_docking_homogeneous_labels.png)

Figure 4. PyMOL-rendered docking-pose gallery using the branch colors established in Figure 1. (A-B) 5E04/paroxetine overview and interaction-pocket zoom, with 5E04 annotations shown in blue. (C-D) 9P3Y/granisetron overview and interaction-pocket zoom, with 9P3Y annotations shown in burgundy/brown. Residue labels are shown as external callouts for readability and are restricted to local proximity annotations from the rendered docked complexes. These residues are not experimental binding determinants.

The PyMOL gallery provides geometric context for the two branch-specific docking hypotheses. The next structural layer summarizes PLIP-derived and proximity-based interaction fingerprints, allowing the visual pose interpretation to be compared with residue-level contact patterns across the two target-ligand branches.

### Figure 5. Residue-level interactions and PLIP/proximity fingerprinting
![Residue-level interactions and docked-pose inspection](composite_figures/Figure_5_two_branch_interactions_context.png)

Figure 5. Structural interaction layer following the PyMOL pose inspection. (A) Ligand-residue interaction matrix. (B) Recurrent interaction residues. (C) Interaction-type distribution. (D) Docked-pose inspection context. The PLIP/proximity analysis is used to describe recurrent contact patterns for 5E04/paroxetine and 9P3Y/granisetron, but recurrent contacts support pose consistency only within the docking model and do not confirm binding experimentally.

### Figure 6. Docking validation, sensitivity and consensus rescoring
![Docking validation, sensitivity and consensus rescoring](composite_figures/Figure_3_validation_consensus.png)

Figure 6. Internal robustness analysis. (A) Candidate/control/decoy score distribution. (B) Docking-box sensitivity heatmap. (C) Consensus scoring heatmap. (D) Consensus-rank comparison. These analyses test prioritization robustness but do not validate biological activity.

## Discussion
This study provides an integrated computational framework for Andes orthohantavirus repurposing hypotheses. The analysis includes approved-source ligand provenance, explicit ligand curation, target-specific docking, consensus and sensitivity analyses, residue-level interaction annotation, chemical-diversity analysis, and independent Gn/Gc conservation context. The strongest global prioritization signal centered on 5E04/paroxetine, but the study design also includes a separate 9P3Y/granisetron glycoprotein branch. The 9P3Y branch is not treated as a global-ranking artifact; it is an exploratory glycoprotein-pocket hypothesis interpreted with conservation mapping, docking-pose inspection, and the currently available granisetron trajectory descriptors. The combined results support a focused shortlist for expert review, but they did not establish antiviral efficacy or clinical relevance.

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
- Molecular dynamics evidence remains incomplete for final candidate-control comparison: 5E04/paroxetine and 9P3Y/granisetron have candidate-trajectory descriptors, whereas matched control/repeat trajectories remain active or queued.
- No biochemical, biophysical, cellular, animal, or clinical validation is included.


### Glycoprotein branch: 9P3Y-granisetron hypothesis
The 9P3Y branch addresses the Andes virus Gn/Gc glycoprotein-related structure. Granisetron was selected because it was the top receptor-specific computational candidate for the 9P3Y site in the docking table, with a Vina score of approximately -6.52 kcal/mol. This branch is distinct from the paroxetine/5E04 nucleoprotein hypothesis. The 9P3Y pocket is interpreted as an exploratory glycan- or NAG-associated surface pocket within the glycoprotein architecture, not as a validated fusion-loop target and not as evidence of antiviral activity.

The Gn/Gc conservation analysis enriches this branch by showing that glycoprotein regions are not uniformly conserved across representative orthohantaviruses. Therefore, any 9P3Y ligand hypothesis were interpreted in the context of local sequence conservation, surface exposure, glycan-associated structure, and the fact that Gc-mediated membrane fusion involves class II fusion machinery. Granisetron should be described only as a putative in silico repurposing candidate for the exploratory 9P3Y pocket. The available 50 ns trajectory descriptors support post-docking structural review, but independent validation remains required.

## Molecular dynamics results available to date

Molecular dynamics was used as a post-docking structural-consistency layer for branch-selected systems when trajectories were available. At this manuscript snapshot, two candidate trajectories had analyzable descriptors: 5E04-paroxetine through 43.25 ns and 9P3Y-granisetron through 50 ns. These descriptors are reported as computational stability indicators only. They are not interpreted as binding free energies, antiviral activity, or experimental validation. Control trajectories were still active or queued and are therefore not used for final comparative MD claims.

**Table 6. Candidate MD descriptors available at the manuscript snapshot.**
| branch | system | descriptor | trajectory length | mean | median | sd | last | unit | interpretation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5E04 nucleoprotein | paroxetine | protein/complex RMSD | 43.25 ns | 0.255 | 0.254 | 0.034 | 0.274 | nm | available-to-date trajectory; interrupted before intended 50 ns endpoint |
| 5E04 nucleoprotein | paroxetine | ligand RMSD after protein fit | 43.25 ns | 2.300 | 0.179 | 3.979 | 0.397 | nm | broad distribution indicates ligand-motion episodes; requires completed repeat/control comparison |
| 5E04 nucleoprotein | paroxetine | protein radius of gyration | 43.25 ns | 2.069 | 2.069 | 0.012 | 2.065 | nm | compactness remained stable in the available trajectory window |
| 9P3Y glycoprotein | granisetron | protein C-alpha RMSD | 50.00 ns | 0.400 | 0.402 | 0.066 | 0.399 | nm | completed candidate-branch trajectory descriptor |
| 9P3Y glycoprotein | granisetron | ligand RMSD after protein fit | 50.00 ns | 1.337 | 0.854 | 2.422 | 0.773 | nm | ligand mobility present; interpreted as structural-consistency evidence only |
| 9P3Y glycoprotein | granisetron | protein radius of gyration | 50.00 ns | 2.888 | 2.888 | 0.034 | 2.865 | nm | global compactness remained within a narrow range |

For 5E04-paroxetine, residue-level contact persistence was available from the existing trajectory and is retained as a supplementary table rather than a second main-text contact table. The most frequent residues included ALA310, PRO311, SER332, SER142, ARG199, GLN335, SER217, ASP312, PHE360, TYR364, GLY145, and PHE307. These contacts support structural inspection of the model but do not establish experimental binding. For 9P3Y-granisetron, the GROMACS hydrogen-bond command did not identify donor/acceptor groups for the ligand topology used in the completed trajectory; therefore, no hydrogen-bond persistence conclusion is made from that tool output.

**Table 7. Remaining MD simulations required for balanced candidate-control comparison.**
| system | role | current status | reason it remains necessary |
| --- | --- | --- | --- |
| 5E04-paroxetine repeat | candidate repeat | queued | needed to complete the intended 50 ns candidate trajectory for the nucleoprotein branch |
| 5E04-ribavirin | computational antiviral-reference control | active at last queue check | needed as a branch-matched reference/control trajectory; not a positive control for Andes virus activity |
| 9P3Y-NAG | structural/redocking control | queued | needed as a glycoprotein-branch structural control if ligand parameterization remains chemically valid |
## Data and supplementary material
The main analysis includes receptor-specific PyMOL docking figures, six composite analysis figures, and core tables; complete machine-readable tables are provided as supplementary material. Full-resolution source figures, complete docking tables, residue-interaction matrices, conservation outputs, ADMET profiles, and ranking tables are provided as supplementary material in the local manuscript package.

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


## PyMOL docking figure residue-label supplement
Residue labels used in the PyMOL zoom panels are provided in `pymol_docking_zoom_residue_labels.csv`. Labels are nearest-residue visual guides for structural interpretation and are not experimental interaction assignments.







