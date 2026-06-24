# In silico drug-repurposing prioritization against Andes orthohantavirus nucleoprotein and Gn/Gc glycoprotein structural targets

## Abstract
A reproducible computational drug-repurposing workflow was applied to two Andes orthohantavirus protein structures: the nucleoprotein structure PDB 5E04 and the Gn/Gc glycoprotein-complex structure PDB 9P3Y. Approved-source compounds from ChEMBL and DrugCentral were standardized, deduplicated, filtered with RDKit-based physicochemical and medicinal-chemistry criteria, prioritized using transparent heuristic QSAR/ADMET scoring, and docked with AutoDock Vina. The final archived screening run assembled 4,986 source records, collapsed them to 3,460 unique ligands, retained 934 after preprocessing, and docked 93 prioritized compounds. Target-level context was assessed before docking: 5E04 was characterized using receptor-intrinsic structural parameters, whereas 9P3Y was contextualized through Gn/Gc conservation and regional alignment analyses across representative orthohantaviruses. The strongest global Vina score was obtained for paroxetine against 5E04 (-8.730 kcal/mol). The 9P3Y receptor-specific ranking prioritized granisetron for the glycoprotein-associated exploratory pocket (-6.523 kcal/mol). Interaction annotation, PyMOL receptor and pose visualization, rule-based ADMET profiling, chemical-diversity analysis, and available molecular-dynamics descriptors were used to support conservative structural interpretation. These results define computational hypotheses for potential antiviral-strategy evaluation for downstream evaluation. They did not by itself establish antiviral activity, binding affinity, safety, or therapeutic efficacy.

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

### Target preparation and docking
PDB 9P3Y and PDB 5E04 were prepared as receptor structures. Docking boxes were explicitly configured and were not inferred or invented by the pipeline. AutoDock Vina docking was performed across the selected receptor/site definitions. Vina scores are reported in kcal/mol as scoring-function outputs and are not interpreted as experimental binding free energies.

### Prioritization, validation, and interaction analysis
No validated Andes-virus QSAR model was supplied; therefore, QSAR prioritization used a transparent heuristic baseline. Candidate selection was not based on Vina score alone. The integrated prioritization combined receptor-specific docking rank, global composite score, QED, cLogP, TPSA, heuristic QSAR priority, rule-based ADMET score, medicinal-chemistry filters, toxicity penalties, receptor-coverage behavior, chemical-diversity context, and downstream structural inspection. Consensus rescoring, control/decoy comparisons, docking-box sensitivity analysis, chemical-space projection, PLIP residue fingerprints, and PyMOL-rendered poses were used to assess internal consistency and structural plausibility. These layers are computational prioritization criteria and are not evidence of antiviral activity.

### Gn/Gc conservation mapping
Representative GPC sequences from Andes, Sin Nombre, Hantaan, Puumala, Seoul, and additional orthohantaviruses were aligned with MAFFT. Conservation, entropy, pairwise identity, estimated Gn/Gc regions, WAASA-like junction mapping, and regional alignments were calculated relative to the Andes reference sequence.

### Molecular dynamics post-docking layer
Molecular dynamics was used as an orthogonal computational follow-up for selected docked complexes when trajectory data were available. The available paroxetine complex trajectory was analyzed for backbone/complex RMSD, ligand RMSD, radius of gyration, protein-ligand hydrogen-bond counts, total protein-ligand contacts, and residue-level contact persistence. These MD descriptors are interpreted as pose-stability and structural-consistency metrics only. They did not establish binding affinity, antiviral activity, or clinical relevance. Systems without completed/analyzable trajectories are reported transparently as pending rather than inferred.

## Results

The Results are presented in the same analytical order as the workflow: target-level context first, then ligand-library filtering, docking prioritization, pose/interactions, ADMET/repurposing context, and finally molecular-dynamics follow-up where data are available. This ordering keeps target biology separate from ligand ranking and avoids using conservation or MD as retrospective evidence for antiviral activity.


### Two-branch correction of candidate-specific interpretation

The analysis separates global ranking from receptor-specific candidate selection. Paroxetine remains the strongest global and 5E04-specific computational candidate in the archived docking run, whereas granisetron is retained as the 9P3Y-specific glycoprotein-branch candidate. This prevents the glycoprotein branch from being incorrectly described through paroxetine-only figures or residue annotations. Therefore, paroxetine-associated structural interpretation is restricted to the 5E04 nucleoprotein pocket, while granisetron-associated structural interpretation is restricted to the exploratory 9P3Y Gn/Gc glycan-associated surface pocket.

### Ligand-library filtering and docking input set

The approved-source ligand set was reduced through a deterministic pre-docking curation workflow. Figure 2 integrates the screening-throughput metrics that were previously tabulated separately: 4,986 ChEMBL/DrugCentral source records were collapsed to 3,460 unique ligands, 934 compounds were retained after RDKit-based preprocessing and medicinal-chemistry filtering, and the top 93 ligands were selected as the docking input set. Docking results, ligand-target assignments, and Vina scores are introduced only in the subsequent docking-results section.

### Conservation and structural context

Figure 1 summarizes the pre-docking target context. The figure separates the 5E04 nucleoprotein branch from the 9P3Y Gn/Gc glycoprotein branch, reports independent receptor-level parameters for 5E04, and maps Gn/Gc conservation metrics only to the glycoprotein context. This organization prevents the nucleoprotein target from being interpreted through glycoprotein conservation statistics and provides a target-level rationale for the two-branch docking design.


The 5E04 nucleoprotein branch was summarized using target-intrinsic receptor parameters computed directly from the prepared PDB receptor file, including residue count, atom count, and approximate Cartesian receptor span. These descriptors are reported separately from Gn/Gc conservation because 5E04 is a nucleoprotein target and is not represented in the glycoprotein sequence alignment. For the 9P3Y glycoprotein branch, Figure 1D integrates the estimated Gn/Gc conservation metrics: the Gc estimate comprised 487 alignment columns with 78.17% mean identity, 91.67% median identity, 0.09% mean gap content, and normalized entropy of 0.159; the Gn estimate comprised 651 alignment columns with 70.06% mean identity, 66.67% median identity, 0.35% mean gap content, and normalized entropy of 0.224. Regional alignments showed conserved windows around the WAASA-like Gn/Gc junction and selected Gn/Gc segments. These conservation features contextualize the glycoprotein branch, but they did not establish druggability or ligand-mediated inhibition.

### Figure 1. Protein-only target context and structural summaries
![Target and conservation context for the two docking branches](composite_figures/Figure_1b_target_conservation_context.png)

Figure 1. Protein-only target-context and independent structural-summary figure. (A) PDB 5E04 nucleoprotein receptor render with no ligand shown. (B) PDB 9P3Y Gn/Gc glycoprotein-complex receptor render with no ligand shown. (C) Independent 5E04 receptor parameters computed directly from the prepared PDB file, including residue count, atom count, and approximate Cartesian span. (D) Estimated Gn and Gc conservation bars mapped explicitly to the 9P3Y glycoprotein target context. The Gc estimate showed higher median identity and lower entropy than the Gn estimate, whereas the 5E04 nucleoprotein analysis remained independent of the Gn/Gc alignment. Conservation contextualizes the glycoprotein branch but did not establish druggability or ligand-mediated inhibition.

### Figure 2. Approved-source ligand filtering funnel
![Approved-source ligand filtering funnel](composite_figures/Figure_2_ligand_filtering_funnel.png)

Figure 2. Pre-docking approved-source ligand filtering funnel. The schematic integrates the ligand-library throughput previously reported as a separate table: 4,986 source records, 3,460 unique deduplicated ligands, 934 accepted compounds, 2,526 preprocessing rejections, and 93 ligands selected for docking. No ligand-target assignments or docking scores are shown at this filtering stage; protein-only renders of PDB 5E04 and PDB 9P3Y indicate the receptor inputs for the subsequent docking module only.


### Figure 3. Conservation and regional alignment context
![Conservation and regional alignment context](composite_figures/Figure_1_conservation_context.png)

Figure 3. Gn/Gc sequence-conservation framework used as pre-docking target context for the 9P3Y glycoprotein branch. (A) ANDV-referenced rolling conservation profile. (B) Pairwise GPC identity matrix among representative orthohantaviruses. (C) WAASA-like Gn/Gc junction alignment. (D) Representative conserved Gc window. These panels contextualize the glycoprotein docking-pocket hypothesis against cross-orthohantavirus sequence conservation. This analysis does not apply to the 5E04 nucleoprotein branch and does not establish ligand-mediated inhibition or druggability.

The Gn/Gc conservation analysis was used as target-level context before docking. After docking, the granisetron-associated residues observed in the 9P3Y pose were interpreted in relation to this glycoprotein conservation framework, whereas the 5E04/paroxetine residues were interpreted only through nucleoprotein structural proximity and PLIP/proximity interaction fingerprints.

## Docking and composite prioritization

Target-wise docking rankings were generated before selecting representative candidates for downstream structural follow-up. In the Methods, compounds were ranked within each receptor using the best AutoDock Vina score observed for the configured site and were annotated with physicochemical and heuristic prioritization metrics. This target-wise presentation prevents the stronger 5E04 score distribution from masking the 9P3Y glycoprotein branch.

**Table 1. Target-wise Top 10 docking and composite-prioritization results.**

| target | rank | ligand | best Vina | QED | cLogP | TPSA | composite |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5E04 | 1 | PAROXETINE_chembl490 | -8.730 | 0.934 | 3.327 | 39.72 | 0.881 |
| 5E04 | 2 | MINAPRINE_chembl278819 | -7.900 | 0.917 | 2.196 | 50.28 | 0.789 |
| 5E04 | 3 | dolasetron_dc3931 | -7.811 | 0.862 | 2.519 | 62.40 | 0.776 |
| 5E04 | 4 | LEFLUNOMIDE_chembl960 | -7.791 | 0.911 | 3.254 | 55.13 | 0.760 |
| 5E04 | 5 | DAPIPRAZOLE_chembl1201216 | -7.557 | 0.864 | 2.288 | 37.19 | 0.746 |
| 5E04 | 6 | AGOMELATINE_chembl10878 | -7.547 | 0.896 | 2.527 | 38.33 | 0.742 |
| 5E04 | 7 | INDOPROFEN_chembl15870 | -7.543 | 0.940 | 3.035 | 57.61 | 0.737 |
| 5E04 | 8 | NATEGLINIDE_chembl783 | -7.524 | 0.846 | 3.261 | 66.40 | 0.746 |
| 5E04 | 9 | CINOXACIN_chembl1208 | -7.482 | 0.862 | 0.843 | 90.65 | 0.730 |
| 5E04 | 10 | INDAPAMIDE_chembl406 | -7.351 | 0.871 | 2.083 | 92.50 | 0.715 |
| 9P3Y | 1 | GRANISETRON_chembl289469 | -6.523 | 0.926 | 2.318 | 50.16 | 0.662 |
| 9P3Y | 2 | GREPAFLOXACIN_chembl583 | -6.472 | 0.880 | 2.280 | 74.57 | 0.650 |
| 9P3Y | 3 | NALTREXONE_chembl19019 | -6.446 | 0.854 | 1.525 | 70.00 | 0.654 |
| 9P3Y | 4 | LEVOFLOXACIN_ANHYDROUS_chembl33 | -6.368 | 0.875 | 1.544 | 75.01 | 0.681 |
| 9P3Y | 5 | INDAPAMIDE_chembl406 | -6.343 | 0.871 | 2.083 | 92.50 | 0.715 |
| 9P3Y | 6 | NATEGLINIDE_chembl783 | -6.313 | 0.846 | 3.261 | 66.40 | 0.746 |
| 9P3Y | 7 | BELZUTIFAN_chembl4585668 | -6.208 | 0.879 | 3.289 | 87.39 | 0.640 |
| 9P3Y | 8 | dolasetron_dc3931 | -6.180 | 0.862 | 2.519 | 62.40 | 0.776 |
| 9P3Y | 9 | DAPIPRAZOLE_chembl1201216 | -6.148 | 0.864 | 2.288 | 37.19 | 0.746 |
| 9P3Y | 10 | LOMEFLOXACIN_chembl561 | -6.133 | 0.882 | 1.796 | 74.57 | 0.658 |

The 5E04 ranking was led by paroxetine, whereas the 9P3Y ranking was led by granisetron. Several compounds appeared in both receptor lists, but the leading candidates were treated as receptor-branch hypotheses rather than as evidence of broad antiviral activity. Vina scores are scoring-function outputs and are not interpreted as experimental binding free energies.

**Table 2. Receptor-branch candidate selection and orthogonal docking checks.**

| target branch | protein / structural hypothesis | candidate selected for branch | selection basis | additional docking check available | interpretation boundary |
| --- | --- | --- | --- | --- | --- |
| Nucleoprotein branch | PDB 5E04; RNA-proximal nucleoprotein pocket hypothesis | PAROXETINE_chembl490 | selected by the integrated ranking: receptor-specific Vina score, global composite score, QED, cLogP/TPSA profile, heuristic QSAR priority, rule-based ADMET score, medicinal-chemistry filters, and receptor-coverage behavior | branch redocking at exhaustiveness 16: -8.887 kcal/mol; Vinardo score-only rescoring of the docked pose: -6.097; docking-box sensitivity mean for paroxetine/5E04: -7.781 +/- 0.860 kcal/mol across 72 perturbed-box pose records; antiviral-reference comparator scores: remdesivir -7.395, ribavirin -6.181, favipiravir -6.171 kcal/mol | secondary scoring and comparator docking support computational prioritization only; they do not establish binding affinity, antiviral activity, or safety |
| Glycoprotein branch | PDB 9P3Y; exploratory glycan/NAG-associated Gn/Gc surface-pocket hypothesis | GRANISETRON_chembl289469 | selected by the integrated receptor-branch ranking: 9P3Y-specific Vina rank, QED, cLogP/TPSA profile, heuristic QSAR/ADMET context, medicinal-chemistry filters, and separation from the 5E04-dominated global score distribution | branch redocking at exhaustiveness 16: -6.523 kcal/mol; Vinardo score-only rescoring of the docked pose: -3.995; comparator docking ranked remdesivir -6.605, granisetron -6.523, paroxetine -6.001, ribavirin -5.281, NAG structural redocking control -4.470, and favipiravir -4.274 kcal/mol | the glycoprotein pocket is exploratory; control/redocking values contextualize the screen but do not validate druggability or entry inhibition |

Paroxetine represented the strongest global and 5E04-specific integrated-prioritization signal in the archived run. Granisetron was retained separately because it ranked first within the 9P3Y receptor-specific list after the same curation and descriptor framework, even though the global composite ranking was dominated by stronger 5E04 scores. The additional docking checks were used to contextualize rank stability and reference-ligand behavior without repeating the primary target-wise ranking in Table 1.

### Validation, sensitivity, and consensus rescoring

The validation and consensus outputs are summarized graphically in Figure 7 and retained as supplementary tables. The docking-validation summary included reference/control, decoy, and top-hit groups; however, the available control and decoy rows did not contain completed score statistics in the archived table and therefore are not retained as a main-text table. The top-hit group produced a mean best score of -7.418 kcal/mol, a median best score of -7.263 kcal/mol, a best score of -8.730 kcal/mol, and a weakest score of -6.974 kcal/mol within the analyzed subset.

Secondary checks were extended for the two receptor-branch leads by rerunning branch docking with exhaustiveness 16 and scoring the resulting top poses with the Vinardo scoring function. This produced a matched branch-level check for paroxetine/5E04 and granisetron/9P3Y, while the larger consensus-ranking table remains supplementary because it was generated for the 5E04-enriched top-pose set. Consensus and rescoring outputs can support rank-order robustness, but they do not estimate true binding free energy.

### Repurposing and computational ADMET context

The prioritized compounds were interpreted within a drug-repurposing framework rather than as de novo antiviral leads. Paroxetine and granisetron were selected as branch-specific computational candidates after integration of receptor-specific docking rank, composite prioritization, physicochemical descriptors, heuristic QSAR scoring, rule-based ADMET profiling, medicinal-chemistry filters, chemical-diversity context, and structural follow-up checks. Their prior clinical or database status was used only to contextualize repurposing plausibility.

Paroxetine was annotated locally as an approved CNS-active SSRI, which supports repurposing relevance but also introduces off-target and CNS-pharmacology considerations. Granisetron was retained as the 9P3Y glycoprotein-branch candidate based on receptor-specific prioritization; its interpretation remains restricted to the exploratory glycoprotein-pocket hypothesis. Therapeutic class, approval status, or historical use did not imply antiviral activity. Rule-based ADMET and off-target flags were treated as computational risk indicators, not as safety conclusions. Complete pharmacological plausibility and expanded ADMET profiles are provided as supplementary machine-readable tables.

### Chemical diversity and interaction fingerprints
The top-hit set was evaluated using Morgan fingerprints, Tanimoto similarity, Bemis-Murcko scaffolds, and residue-level PLIP fingerprints. A two-dimensional chemical-space projection based on molecular fingerprints/descriptors was generated to verify that candidate selection was not driven by a single scoring column alone; the projection is reported with the chemical-diversity figure and retained with the supplementary chemical-space outputs. Recurrent contacts were observed in the docking-pose interaction layer, including residues such as TYR364, TYR125, PHE360, ARG367, and ALA310 in the local residue-frequency table. These contacts support pose consistency within the model but do not confirm binding experimentally.

## Structural and prioritization figures

**Figure interpretation.** Candidate-specific structural figures are interpreted by target branch: paroxetine is assigned to the 5E04 nucleoprotein branch, whereas granisetron is assigned to the 9P3Y Gn/Gc glycoprotein branch. Molecular-dynamics metrics are reported only where completed or analyzable trajectories are available.

### Figure 4. Docking and composite prioritization
![Docking and composite prioritization](composite_figures/Figure_2_two_branch_docking_prioritization.png)

Figure 4. Structure-based prioritization. (A) Vina score distributions by target. (B) Top-hit receptor score heatmap. (C) Composite score component breakdown. (D) Docking/QSAR/ADMET prioritization space. Scores are computational ranking outputs, not experimental affinities.




### Structural docking pose visualization by PyMOL
To avoid mixing the nucleoprotein and glycoprotein hypotheses, docking-pose visualization was separated by target. For each target, one PyMOL figure shows the global docked pose in the protein context and one zoom panel shows the predicted local pocket environment. Labels were regenerated as external callouts rather than embedded 3D text to improve readability and avoid overlap with helices, surfaces, and ligand sticks.

### Figure 5. Two-branch PyMOL docking-pose gallery
![Two-branch PyMOL docking-pose gallery](composite_figures/Figure_5_two_branch_pymol_docking_clean_labels.png)

Figure 5. PyMOL-rendered docking-pose gallery enforcing the two-branch interpretation. (A-B) 5E04/paroxetine overview and interaction-pocket zoom. (C-D) 9P3Y/granisetron overview and interaction-pocket zoom. Residue labels are shown as external callouts for readability and are restricted to local proximity annotations from the rendered docked complexes. These residues are not experimental binding determinants.

The PyMOL gallery provides geometric context for the two branch-specific docking hypotheses. The next structural layer summarizes PLIP-derived and proximity-based interaction fingerprints, allowing the visual pose interpretation to be compared with residue-level contact patterns across the two target-ligand branches.

### Figure 6. Residue-level interactions and PLIP/proximity fingerprinting
![Residue-level interactions and docked-pose inspection](composite_figures/Figure_5_two_branch_interactions_context.png)

Figure 6. Structural interaction layer following the PyMOL pose inspection. (A) Ligand-residue interaction matrix. (B) Recurrent interaction residues. (C) Interaction-type distribution. (D) Docked-pose inspection context. The PLIP/proximity analysis is used to describe recurrent contact patterns for 5E04/paroxetine and 9P3Y/granisetron, but recurrent contacts support pose consistency only within the docking model and do not confirm binding experimentally.

### Figure 7. Docking validation, sensitivity and consensus rescoring
![Docking validation, sensitivity and consensus rescoring](composite_figures/Figure_3_validation_consensus.png)

Figure 7. Internal robustness analysis. (A) Candidate/control/decoy score distribution. (B) Docking-box sensitivity heatmap. (C) Consensus scoring heatmap. (D) Consensus-rank comparison. These analyses test prioritization robustness but do not validate biological activity.

### Figure 8. Chemical diversity and computational ADMET context
![Chemical diversity and computational ADMET context](composite_figures/Figure_4_two_branch_admet_context.png)

Figure 8. Chemical interpretability layer. (A) Chemical-space projection. (B) Top-hit Tanimoto similarity. (C) Bemis-Murcko scaffold frequency. (D) ADMET/off-target risk-flag matrix. These are computational descriptors and risk proxies, not safety conclusions.

## Discussion
This study provides an integrated computational framework for Andes orthohantavirus repurposing hypotheses. The analysis includes approved-source ligand provenance, explicit ligand curation, target-specific docking, consensus and sensitivity analyses, residue-level interaction annotation, chemical-diversity analysis, and independent Gn/Gc conservation context. The strongest global prioritization signal centered on 5E04/paroxetine, but the study design also includes a separate 9P3Y/granisetron glycoprotein branch. The 9P3Y branch is not treated as a global-ranking artifact; it is an exploratory glycoprotein-pocket hypothesis that were interpreted with conservation mapping and pending MD results. The combined results support a focused shortlist for expert review, but they did not establish antiviral efficacy or clinical relevance.

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

The Gn/Gc conservation analysis enriches this branch by showing that glycoprotein regions are not uniformly conserved across representative orthohantaviruses. Therefore, any 9P3Y ligand hypothesis were interpreted in the context of local sequence conservation, surface exposure, glycan-associated structure, and the fact that Gc-mediated membrane fusion involves class II fusion machinery. Granisetron should be described only as a putative in silico repurposing candidate for the exploratory 9P3Y pocket pending completion of the queued/active MD analysis and independent validation.

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


### Remote MD job status and required simulations to close the study
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


### Figure 9. Two-branch molecular-dynamics evidence status
![Two-branch molecular-dynamics evidence status](composite_figures/Figure_6_two_branch_md_status.png)

Figure 9. Molecular-dynamics evidence status for the two target-candidate branches. (A) 5E04/paroxetine has an analyzable trajectory available to date. (B) 9P3Y/granisetron is explicitly marked as pending because no completed/analyzable 50 ns trajectory was available at this manuscript snapshot. No stability metrics are inferred for unavailable granisetron data.

### Figure 10. Two-branch MD contact-analysis status
![Two-branch MD contact-analysis status](composite_figures/Figure_7_two_branch_md_contacts_status.png)

Figure 10. Contact-analysis status for the two target-candidate branches. (A) Available 5E04/paroxetine contact profile from the existing trajectory. (B) 9P3Y/granisetron contact persistence is pending and is not inferred until the completed trajectory is analyzed.

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
