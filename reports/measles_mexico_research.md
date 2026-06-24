# Measles in Mexico: research brief

## 1) Current epidemiologic signal

Mexico is no longer a low-signal measles environment. The official and PAHO updates show a fast-moving resurgence:

- By **18 April 2025**, WHO/PAHO reported **421 confirmed measles cases in Mexico**, including **1 death**.
- The official Mexico Ministry of Health outbreak page was activated in **May 2025** and published daily situation reports.
- By **EW 19 of 2026** (PAHO epidemiological alert published **29 May 2026**), Mexico had **10,920 confirmed cases** and **13 deaths**, with cases reported in **31 federative entities**.
- PAHO also noted that **national MMR coverage in 2025 reached 86.7% for the first dose and 84.4% for the second dose**, which is consistent with the persistence of susceptible pockets.

Key implication: the project should treat Mexico as a **dynamic outbreak setting with repeated importation and sustained local amplification**, not as a single isolated event.

Sources:

- [WHO/PAHO measles outbreak update, 28 Apr 2025](https://www.who.int/southeastasia/outbreaks-and-emergencies/disease-outbreak-news/item/2025-DON565)
- [PAHO epidemiological update, 2 May 2025](https://www.paho.org/sites/default/files/2025-05/2025-may-2-phe-epi-update-measles-final.pdf)
- [Mexico Ministry of Health: Sarampion 2025 - Informacion relevante](https://www.gob.mx/salud/acciones-y-programas/sarampion-2025-informacion-relevante)
- [PAHO epidemiological alert, 29 May 2026](https://www.paho.org/sites/default/files/2026/05/2026-may-29-phe-epialert-measles-engfinal.pdf)

## 2) Molecular epidemiology of measles in Mexico

The strongest recent Mexico-specific molecular signal is that the 2025-2026 epidemic was not monolithic:

- A 2026 analysis of Mexico's outbreak reports **two independent introductions**:
  - **D8** as the dominant lineage, linked to the North American outbreak.
  - **B3** in Oaxaca, consistent with a separate introduction.
- The same analysis reports that historically only **26 Mexico sequences** were available in GenBank from **2003-2021**, mostly **N-450** nucleoprotein fragments, reflecting sparse genomic surveillance.
- Historically detected genotypes in Mexico included **D4, D8, D9, and H1**.

Why this matters:

- You should expect a **mixed importation + dissemination** model, not one local endemic strain.
- The project should include both **broad phylogenetic placement** and **fine-grained outbreak lineage tracking** using N-450 and, where available, complete genomes.
- The scarcity of historical sequences means your pipeline should be designed to **recover maximum information from partial sequences**, not only complete genomes.

Sources:

- [Social Determinants and Outbreak Dynamics of the 2025 Measles Epidemic in Mexico](https://pmc.ncbi.nlm.nih.gov/articles/PMC12944898/)
- [Molecular epidemiology and phylogenetic history of B3 and D8 measles viruses](https://pubmed.ncbi.nlm.nih.gov/32580384/)
- [NCBI Virus help and outbreak statistics](https://www.ncbi.nlm.nih.gov/labs/virus/vssi/docs/help/)

## 3) Biological rationale: what to target

Measles virus is a morbillivirus with a small negative-sense RNA genome. The functional picture is clear enough to guide both surveillance and docking:

| Target | Biological role | Why it matters for the project | Structural resources |
|---|---|---|---|
| H (hemagglutinin) | Receptor attachment | Important for entry, receptor specificity, antigenic drift, and immune escape surveillance | [3INB](https://www.rcsb.org/structure/3INB), [3ALZ](https://www.rcsb.org/structure/3ALZ), [4GJT](https://www.rcsb.org/structure/4GJT) |
| F (fusion) | Membrane fusion | Strong entry-target candidate; several inhibitor-bound structures exist | [5YXW](https://www.rcsb.org/structure/5YXW), [5YZC](https://www.rcsb.org/structure/5YZC), [5YZD](https://www.rcsb.org/structure/5YZD), [8UT2](https://www.rcsb.org/structure/8UT2), [8UTF](https://www.rcsb.org/structure/8UTF), [9COE](https://www.rcsb.org/structure/9COE), [9COG](https://www.rcsb.org/structure/9COG) |
| N-P-L complex | Transcription and replication | Best direct-acting antiviral target class; strongest structural/mechanistic case | [4UFT](https://www.rcsb.org/structure/4UFT), [6H5Q](https://www.rcsb.org/structure/6H5Q), [9DUT](https://www.rcsb.org/structure/9DUT), [9OCF](https://www.rcsb.org/structure/9OCF), [9VXX](https://www.rcsb.org/structure/9VXX) |
| M | Assembly/budding | Secondary target; useful for systems biology, less mature for repurposing docking | [7SKS](https://www.rcsb.org/structure/7SKS) |

Receptor biology is also well-defined:

- **SLAMF1/CD150** is the main receptor in immune cells.
- **NECTIN4** is the epithelial receptor.
- **CD46** is used mainly by vaccine/lab-adapted strains.

Sources:

- [UniProt H protein entry](https://www.uniprot.org/uniprotkb/P08362/entry)
- [UniProt F protein entry](https://www.uniprot.org/uniprotkb/P69357/entry)
- [UniProt N protein entry](https://www.uniprot.org/uniprotkb/P04851/entry)
- [UniProt L protein entry](https://www.uniprot.org/uniprotkb/P12576/entry)
- [RCSB PDB measles virus proteins overview](https://pdb101.rcsb.org/motm/231)

## 4) Human susceptibility and public health context

Two Mexico-specific serology studies support the idea that the outbreak could find a susceptible adult pool:

- A 2025 population serosurvey found **82.4% PRNT seroprevalence overall**, but only **63.6% in ages 20-29**.
- The discussion explicitly warns that low seroprevalence in young adults could facilitate outbreak spread after imported introductions.

This is important for prioritization because:

- It explains why adult amplification is plausible in Mexico.
- It supports a strategy that combines **genomic surveillance** with **serology-informed risk stratification**.

Sources:

- [A population-based measles serosurvey in Mexico: Implications for re-emergence](https://pubmed.ncbi.nlm.nih.gov/39970596/)
- [National seroprevalence survey in Mexico using PRNT](https://pubmed.ncbi.nlm.nih.gov/33060627/)

## 5) Antiviral repurposing logic

The best computational strategy is to prioritize **direct-acting antivirals** first, then entry inhibitors, then host-directed compounds.

### Highest-priority target class

1. **L-P polymerase complex**
   - Best mechanistic fit for small molecules.
   - Strong structural support and a validated allosteric inhibitor pocket.
   - ERDRP-0519 is not a repurposed drug, but it is a very good **reference ligand** and pocket validator.

2. **F protein**
   - Good for entry inhibition and for peptide-like inhibitors.
   - Has multiple inhibitor-bound structures that can guide pocket definition.

3. **H protein**
   - Useful for receptor-interface mapping and antigenic surveillance.
   - Less attractive for classical small-molecule docking because it is a broad protein-protein interface.

### Repurposing candidates to rationalize first

- **Remdesivir**
  - Broad RNA polymerase inhibitor.
  - MeV macaque data show **transient suppression of viral RNA**, but **no improvement in clinical disease** with either prophylaxis or late treatment.
  - Good as a positive pharmacology comparator, but not a strong monotherapy expectation.

- **Ribavirin**
  - Has in vitro activity and has been used in severe measles cases, especially in immunocompromised patients.
  - Evidence is weak and heterogeneous, so it should be treated as a historical comparator rather than a likely high-confidence hit.

- **Favipiravir**
  - Strong mechanistic rationale as an RdRp-active nucleoside analog.
  - In silico work suggests binding to the MeV RdRp active site.
  - Useful as a prioritized repurposing candidate even if MeV-specific in vivo evidence remains limited.

- **Fusion-inhibitory peptides / AS-48-like entry inhibitors**
  - Not classical repurposing from the clinic, but extremely useful as structural controls.
  - They anchor the entry-inhibition side of the project and help validate F-pocket docking.

Sources:

- [CDC clinical overview of measles](https://www.cdc.gov/measles/hcp/clinical-overview/index.html)
- [Repurposing an in vitro measles dissemination assay for screening antiviral compounds](https://pmc.ncbi.nlm.nih.gov/articles/PMC9230603/)
- [Effect of remdesivir post-exposure prophylaxis and treatment on pathogenesis of measles in rhesus macaques](https://pmc.ncbi.nlm.nih.gov/articles/PMC10116456/)
- [Detailed molecular interactions between favipiravir and RNA viruses in silico](https://pubmed.ncbi.nlm.nih.gov/35215932/)
- [Therapeutic targeting of measles virus polymerase with ERDRP-0519](https://pmc.ncbi.nlm.nih.gov/articles/PMC7935272/)
- [Structural basis of measles virus polymerase inhibition by nonnucleoside inhibitor ERDRP-0519](https://www.nature.com/articles/s41467-025-64128-0)

## 6) Database stack for the project

### Surveillance and sequence data

- [NCBI Virus](https://www.ncbi.nlm.nih.gov/labs/virus/vssi/)
- [GenBank / NCBI Nuccore](https://www.ncbi.nlm.nih.gov/nuccore/)
- [NCBI Datasets for viral genomes](https://www.ncbi.nlm.nih.gov/datasets/)
- [Mexico Ministry of Health measles portal](https://www.gob.mx/salud/acciones-y-programas/sarampion-2025-informacion-relevante)
- [PAHO measles updates and alerts](https://www.paho.org/)

### Functional and structural resources

- [UniProt](https://www.uniprot.org/)
- [RCSB PDB](https://www.rcsb.org/)
- [PDB-101 measles virus proteins](https://pdb101.rcsb.org/motm/231)

### Chemistry / repurposing libraries

- ChEMBL
- PubChem
- BindingDB
- DrugBank

### Serology / epidemiology

- ENSANUT-based serology papers
- PAHO and Mexico Ministry official bulletins
- CDC and WHO overview pages

## 7) Recommended computational pipeline

### Phase A. Build the Mexico-focused sequence set

1. Query NCBI Virus/GenBank for Mexico-associated measles records.
2. Separate by:
   - complete genomes
   - N-450 fragments
   - H gene fragments
3. Add North American comparator sequences from 2024-2026.
4. Annotate genotype, lineage, sample date, state, and importation status.

### Phase B. Phylogenetics and surveillance

1. Align N-450 and H-gene data.
2. Build genotype trees.
3. Estimate introductions, local clusters, and dispersal corridors.
4. Overlay metadata with vaccination and outbreak data.

### Phase C. Structure-guided repurposing

1. Dock approved / clinically advanced antivirals against:
   - L-P complex
   - F prefusion state
   - selected H receptor interfaces only if you specifically want entry blockers
2. Rank compounds by:
   - pocket occupancy
   - pose stability
   - interaction persistence in MD
   - strain robustness across B3 / D8 backgrounds
   - pharmacokinetics and BBB exposure if CNS risk is a concern

### Phase D. Molecular dynamics and prioritization

1. Run short prescreen MD on top poses.
2. Use RMSD / RMSF / H-bond occupancy / contact persistence.
3. Apply MM/GBSA or similar rescoring.
4. Reject ligands that only dock well but do not remain stable.

## 8) Practical interpretation

My working conclusion is:

- **Mexico needs a combined genomic surveillance + outbreak analytics + repurposing pipeline.**
- The **best antiviral target is the L-P polymerase complex**, with the **F protein** as the second most attractive structural target.
- **H protein** is more valuable for surveillance and immune escape interpretation than for primary small-molecule docking.
- The **best repurposing candidates to prioritize first** are **remdesivir**, **favipiravir**, and **ribavirin**, but with realistic expectations and a clear distinction between **mechanistic plausibility** and **clinical proof**.
- **ERDRP-0519**, **AS-48**, and peptide fusion inhibitors are best used as **structural benchmarks / positive controls**, not as repurposed drugs.

## 9) Project narrative for a formal study

### Problem statement

Mexico is experiencing a measles resurgence that is not adequately explained by a single importation event. The available epidemiologic and molecular evidence points to recurrent introductions, heterogeneous transmission corridors, and persistent susceptibility in parts of the population despite nominally high vaccine coverage. In practical terms, this creates a public health problem with two coupled dimensions:

- a **surveillance problem**, because the viral lineages circulating in Mexico are still incompletely resolved at the genomic level;
- a **therapeutic problem**, because measles has no established antiviral standard of care, and severe cases still rely on supportive management and selective off-label use.

### Central hypothesis

The working hypothesis for the project is that the recent Mexican measles resurgence is sustained by a combination of imported viral lineages, uneven population immunity, and local transmission amplification, and that the virus offers actionable structural targets for **repurposing-based antiviral prioritization**. Within that framework, the **L-P polymerase complex** should emerge as the most tractable direct-acting target, with the **F protein** as the leading entry target.

### General objective

To characterize the biological and genomic basis of measles circulation in Mexico and to rationally prioritize candidate antivirals through structure-based repurposing, beginning with docking and molecular dynamics analyses against validated measles virus targets.

### Specific objectives

1. Define the current Mexican measles molecular landscape from published sequence and outbreak data.
2. Identify the most plausible structural and functional targets for antiviral intervention.
3. Build a repurposing-oriented ligand panel from approved or clinically advanced antivirals.
4. Dock prioritized compounds against the selected viral targets and compare binding plausibility across targets and genotypes.
5. Use molecular dynamics to test whether the highest-ranking poses remain stable and mechanistically credible.

### Working manuscript logic

The manuscript can be organized around a simple argument:

1. Mexico is in a measurable measles resurgence.
2. Existing genomic surveillance is sparse relative to the scale of the problem.
3. The outbreak contains evidence of multiple introductions and local amplification.
4. The virus has well-defined structural biology that supports rational target selection.
5. Repurposing-based computational screening can generate a short list of candidate antivirals for follow-up validation.

### First phase of the computational program

For the current phase, the study will remain entirely computational and will focus on:

- receptor/entry biology where it is structurally informative,
- polymerase-centered target prioritization,
- docking of repurposing candidates,
- molecular dynamics refinement,
- and post-docking triage using interaction persistence rather than docking score alone.

The first-pass priority remains the **L-P complex**, followed by the **F protein**. H protein analysis should be retained primarily for surveillance, receptor-binding interpretation, and genotype-context discussion rather than as the main docking target.

## 10) Next step

If you want, I can turn this into one of three concrete artifacts next:

1. a Mexico measles sequence-retrieval script and metadata table,
2. a docking/MD target-prioritization notebook for MeV,
3. a remote SSH workspace setup on `root@100.65.208.11` for sequence analysis and docking runs.
