
## METHODS: STRUCTURE-GUIDED ANTIVIRAL TARGETING

### Multiple Sequence Alignment and Conservation Analysis

A multiple sequence alignment (MSA) was constructed from measles L-protein
sequences including reference lineages (B3: AY345881, D8: MK370237,
N-450: AF280864) and outbreak-derived sequences from Mexico (2025–2026 isolates,
B3 and D8 lineages, n=3). Sequences were globally aligned using pairwise
Needleman-Wunsch alignment (Biopython v1.81, default parameters). For each
aligned position, conservation was quantified as the frequency of the most
common nucleotide in the column. Positions with ≥90% identity across sequences
were classified as "highly conserved." Contiguous regions with ≥85% mean
conservation (using a 20 bp sliding window) were identified as the conserved
CORE region of the L-protein catalytic domain, expected to encompass the
nucleoside triphosphate (NTP) binding pocket.

### Structure-Guided Docking Grid Definition

Two docking grids were defined based on structural and evolutionary information:

**Grid 1 (Fullscreen Screening):** A large cubic grid (25 × 25 × 25 Å) centered
on the L-protein active site (PDB 9OCF, coordinates 170.5, 167.9, 187.2) was
used for initial virtual screening of the compound library. This grid encompasses
the entire catalytic domain and surrounding regions to identify binders without
spatial bias.

**Grid 2 (Refined NTP-Pocket Docking):** Based on MSA conservation analysis,
a refined grid (12 × 10 × 14 Å) was defined to target specifically the
conserved NTP-binding pocket. This smaller grid reflects the high conservation
of the catalytic core and enables deeper sampling (exhaustiveness=12, 20 poses)
to identify optimal binders within the functionally critical region.

Docking was performed using AutoDock Vina (v1.2) with Lamarckian genetic
algorithm; energy range was set to 3 kcal/mol with default scoring parameters
(MMFF94 force field, implicit solvation).

### Lineage-Specific Validation

Top-ranked compounds from both grids were re-docked against homology models
of B3 and D8 lineages to assess lineage-independent binding (Δ≤1 kcal/mol
variation acceptable). This ensures antiviral candidates retain efficacy across
circulating Mexican genotypes.
