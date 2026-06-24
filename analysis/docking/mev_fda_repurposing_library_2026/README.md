# Measles FDA repurposing library (2026 build)

This package contains the FDA-approved chemical universe assembled for the first measles virtual screening campaign.

## Selection logic
- Primary approval anchor: DrugCentral FDA-approved registry.
- Structure source: DrugCentral 2023 structure archive.
- Orthogonal corroboration: ChEMBL max_phase=4 small molecules.
- Hard exclusions for first-pass VS: isotopic labels, nonclassical elements, PAINS-positive compounds.
- Brenk alerts are retained as priority flags, not hard exclusions.

## Current counts
- DrugCentral FDA entries: 2331
- Structured FDA parent molecules: 1876
- ChEMBL-supported FDA molecules: 1612
- Primary FDA VS subset: 1260
- High-confidence FDA VS subset: 1165
- L first-pass subset: 1165
- F first-pass subset: 1020
- L tier 1 clean subset: 692
- L tier 2 Brenk-flag subset: 473

## Key files
- Master library: `I:\MDATOS2.0\analysis\docking\mev_fda_repurposing_library_2026\mev_fda_repurposing_master_library.csv`
- Primary FDA VS subset: `I:\MDATOS2.0\analysis\docking\mev_fda_repurposing_library_2026\campaigns\vs_primary_fda_screen.csv`
- High-confidence L subset: `I:\MDATOS2.0\analysis\docking\mev_fda_repurposing_library_2026\campaigns\lp_first_pass_high_confidence.csv`
- High-confidence F subset: `I:\MDATOS2.0\analysis\docking\mev_fda_repurposing_library_2026\campaigns\f_first_pass_high_confidence.csv`
- L tier 1 SMILES: `I:\MDATOS2.0\analysis\docking\mev_fda_repurposing_library_2026\campaigns\lp_first_pass_tier1_clean.smi`
- L tier 2 SMILES: `I:\MDATOS2.0\analysis\docking\mev_fda_repurposing_library_2026\campaigns\lp_first_pass_tier2_brenk_flag.smi`
