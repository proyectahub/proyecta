# MeV L-P receptor preparation

Entry used: `9OCF` (`https://www.rcsb.org/structure/9OCF`)

Prepared outputs:
- `prepared_structures/9OCF_LP_complex_receptor_noH.pdb`: full L-P complex without ligand or waters.
- `prepared_structures/9OCF_L_chain_receptor_noH.pdb`: L-chain-only receptor without ligand or waters.
- `prepared_structures/9OCF_ERDRP0519_reference_pose.pdb`: reference ligand coordinates extracted from the holo complex.
- `metadata/9OCF_chain_summary.csv`: chain-level composition of the complex.
- `metadata/9OCF_binding_site_residues_6A.csv`: residues within 6 A of the reference ligand.
- `metadata/9OCF_grid_definition.json`: docking-box centroid and suggested box dimensions derived from the bound ligand.
- `metadata/9OCF_conserved_core_residues_4A.csv`: residues satisfying both direct-contact (`<=4 A`) and complete-conservation criteria.
- `metadata/9OCF_core_contact_ligand_atoms.csv`: ERDRP-0519 atoms retained in the conserved-core refinement geometry.
- `metadata/9OCF_refinement_grid_conserved_core.json`: stricter docking-box definition derived from the conserved interaction core.
- `metadata/ERDRP0519_reference.smi`: canonical SMILES seed for ligand handling.

Key preparation notes:
- The detected reference ligand is `ERDRP-0519` with structure code `A1EF9` and author code `ERD` in chain `A` at residue `2500`.
- The 6 A contact shell contains `31` protein residues.
- All detected ligand-contact residues belong to chain(s): A.
- The full complex was retained because the cryo-EM conformation is L-P specific, but the contact shell is confined to the polymerase L chain.
- Hydrogens and protonation states have not yet been assigned. This package is therefore the cleaned structural starting point rather than the final docking-ready protonated receptor.

Suggested next docking steps:
1. Assign protonation states and add hydrogens to the chosen receptor representation.
2. Convert receptor and ligand files to the docking engine format.
3. Use `9OCF_grid_definition.json` as the first-pass search box centered on the ERDRP-0519 pose.
4. Use `9OCF_refinement_grid_conserved_core.json` for conserved-core redocking or rescoring after the first-pass screen.
