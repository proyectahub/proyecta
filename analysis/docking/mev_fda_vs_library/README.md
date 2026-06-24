# Measles FDA Virtual Screening Library

This directory contains the first-pass FDA-approved repurposing library prepared for measles virus target screening.

## Design decisions
- Inclusion basis for the primary screening universe: DrugCentral FDA-approved small molecules.
- Hard exclusion by classical Lipinski/Veber rules was disabled during master-library curation.
- First-pass screening subsets were defined after preprocessing by a soft physicochemical envelope and an alert-clean rule.
- `L-P` retains explicit comparator ligands even when they fall outside the first-pass FDA screen.
- `F` controls are documented separately because structure extraction remains pending.

## Current counts
- Raw FDA-approved source records: 1858
- Accepted after chemical standardization: 1856
- `L-P` first-pass screening subset: 740
- `F` first-pass screening subset: 673
- `L-P` comparator ligands prepared: 4

## Key files
- Master curated library: `I:\MDATOS2.0\analysis\docking\mev_fda_vs_library\mev_fda_curated_master_library.csv`
- `L-P` first-pass subset: `I:\MDATOS2.0\analysis\docking\mev_fda_vs_library\campaigns\lp_first_pass_screen.csv`
- `F` first-pass subset: `I:\MDATOS2.0\analysis\docking\mev_fda_vs_library\campaigns\f_first_pass_screen.csv`
- `L-P` comparator manifest: `I:\MDATOS2.0\analysis\docking\mev_fda_vs_library\controls\lp_comparator_manifest.csv`
- `L-P` first-pass SMILES bundle: `I:\MDATOS2.0\analysis\docking\mev_fda_vs_library\campaigns\lp_first_pass_screen.smi`
- `L-P` campaign manifest: `I:\MDATOS2.0\analysis\docking\mev_fda_vs_library\campaigns\lp_campaign_manifest.json`
