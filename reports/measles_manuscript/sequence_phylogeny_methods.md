## Sequence Retrieval and Curation

Public measles virus nucleotide records were retrieved from NCBI GenBank on June 6, 2026 using programmatic Entrez queries. Candidate panels were first collected with broad query strings and were then curated by exact source metadata (`geo_loc_name` or `country`) rather than by free-text title matches. This step was necessary because naive text searches for Mexico also retrieved records labeled as New Mexico, USA. Unique records were classified into exact Mexico, exact Latin America, and global complete-genome context panels. Coding sequences for N, F, H, and L were extracted from GenBank CDS features using exact gene qualifiers first and product-name fallback rules second.

## Alignment and Phylogeny

Nucleotide alignment of the combined N panel and amino-acid alignment of the combined F and L panels were performed remotely on `root@100.65.208.11` with MAFFT v7.505. Maximum-likelihood reconstruction for N and F was performed with IQ-TREE2 v2.0.7 using ModelFinder, SH-aLRT support, and 1,000 ultrafast bootstrap replicates. A FastTree v2.1.11 amino-acid tree was additionally generated for L to preserve a phylogenetic context while prioritizing the conservation analysis required for docking.

## Structure-Guided Conservation Mapping

Docking-relevant contact residues were extracted from the RCSB structures 5YZC (F bound to AS-48) and 9OCF (L bound to ERDRP-0519). Residues within 6 Å of the bound ligand were mapped onto the aligned F and L reference positions, and per-column conservation metrics were computed as consensus residue, consensus frequency, Shannon entropy, gap fraction, and residue-state richness. Structural coherence among target-engaged templates was evaluated by pairwise Cα superposition across 5YZC, 5YZD, 9OCF, 9OCE, and 9OCH.