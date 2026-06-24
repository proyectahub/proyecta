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
