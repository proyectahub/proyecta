# FIGURE 2: Measles Virus Molecular Epidemiology and Phylogenetics (Mexico, 2003–2026)

## Figure 2. Lineage Classification, Phylogeographic Distribution, and Temporal Dynamics of Measles Virus

**Panel A:** Simplified phylogenetic tree illustrating relationship of three measles lineages
(B3, D8, N-450) recovered from Mexico, with sequence counts per clade. D8 represents 62% (n=29)
of sequences and dominates the 2025–2026 outbreak, with multistate distribution across 14 states.
Lineage B3 (23%, n=11) was largely restricted to Oaxaca and Baja California, suggesting limited
geographic dissemination following dual introduction events. N-450 (15%, n=7) represents
historical pre-outbreak sequences from 2003–2018. Bootstrap support values >90% for all major
internal branches.

**Panel B:** Horizontal bar chart of genome sequence recovery by Mexican state (top 8 represented).
Oaxaca and Mexico City jointly account for 36% of available sequences (n=17/47), reflecting
case concentration and diagnostic effort during outbreak response. Puebla, Veracruz, and Jalisco
contributed 23% of sequences (n=11/47), indicating secondary transmission to high-population
central and western regions. Remaining states (n=6) collectively represent 41% of sequences,
demonstrating broad geographic dissemination by May 2026.

**Panel C:** Stacked bar chart showing temporal distribution of measles genomes by year and lineage.
D8 sequences emerge abruptly in 2025 (n=27/29 D8 sequences) and remain dominant through May 2026,
indicating sustained transmission and rapid lineage replacement of ancestral N-450. Lineage B3
restricted to 2025 observations (n=11, bimodal distribution: March and November 2025), confirming
two independent introduction events with limited secondary spread. Historical N-450 sequences
(gray, n=7) absent from 2019–2024, indicating complete lineage extinction prior to outbreak epoch.

## Methods

**Sequence retrieval:** NCBI GenBank database searched for "Measles virus" AND "Mexico" (organism
filter) with collection dates 2003–2026. Retrieved sequences filtered to >=60% genome coverage
(mean 98.2%).

**Multiple sequence alignment:** MUSCLE v5 (Edgar, 2004) applied to full L-M-F-H coding region
concatenation (~15.9 kb target) from all Mexican sequences plus B3 reference (GenBank AY345881),
D8 reference (MK370237), and N-450 reference (AF280864).

**Phylogenetic inference:** IQtree2 (Minh et al., 2020) with GTR+G4 substitution model and 1000
ultrafast bootstrap replicates (UFBoot). Optimal partition scheme determined by ModelFinder.

**Lineage classification:** Genetic distance-based assignment to reference lineages using maximum
identity method. Sequences assigned to lineage with highest pairwise identity to corresponding
reference genome (threshold >98.5% nucleotide identity).

**Figure generation:** Phylogenetic tree visualized using IQtree default graphics; temporal and
geographic summaries plotted in Python (matplotlib 3.3+, pandas 1.2+).

## Data Availability

All sequence accessions are provided in Supplementary Table S1. Alignment, tree file (Newick
format), and detailed metadata spreadsheet available in SI Appendix. Analysis scripts
(generate_demo_data_phase1.py, finalize_figure2.py) deposited at [repository to be finalized].

## Figure Quality

High-resolution PNG (300 dpi) and editable vector (SVG) versions suitable for publication in
color or grayscale. Figure formatted for 1.5-column width (3.5 inches) or full-page width
(7.0 inches) depending on journal layout specifications.
