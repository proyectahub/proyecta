# Molecular dynamics preparation and launch report

Run bundle: `20260513T082956Z_full_70f1959a`

This MD launch is a computational stability follow-up to the docking screen. It does not establish antiviral activity, target engagement, safety, or clinical relevance.

## Software inventory

- GROMACS portal: `http://127.0.0.1:8765`
- GROMACS command reported by portal: `/usr/local/bin/gmx`
- GROMACS version reported by portal: `2025.3`
- GPU detected by portal: `NVIDIA GeForce RTX 5080`
- Portal GPU recommendation used for launch: `False`
- Vina: `/usr/bin/vina`
- Open Babel: `/usr/bin/obabel`
- ACPYPE: `/home/svirology/gromacs_desktop_ui/.tools/acpype-venv/bin/acpype`

## MD protocol

Pilot simulations use `amber99sb-ildn`, `tip3p`, 0.15 M salt, 310 K, 1 bar, dodecahedral box with 1.0 nm padding, energy minimization, 10 ps NVT, 10 ps NPT-equil, 10 ps NPT-final, and `50.0` ns production. These settings are intentionally short for launch validation and should be extended only after confirming topology and equilibration quality.

## Selected systems

| Receptor | Ligand/control | Type | Vina score (kcal/mol) | Portal job | Queue status | Queue position |
|---|---|---|---:|---|---|---:|
| 5E04 | PAROXETINE_chembl490 | top docked candidate | -8.73 | 20260513-203553-andv-20260513t082956z-full-70f1959a-5e04-paroxetine-chembl490-pilotmd | queued | 1 |
| 9P3Y | GRANISETRON_chembl289469 | top docked candidate | -6.523 | 20260513-203553-andv-20260513t082956z-full-70f1959a-9p3y-granisetron-chembl289469-pilotmd | queued | 2 |
| 5E04 | RIBAVIRIN_control | computational antiviral reference | -6.181 | 20260513-203553-andv-20260513t082956z-full-70f1959a-5e04-ribavirin-control-pilotmd | queued | 3 |
| 9P3Y | NAG_structural_control | glycan-fragment structural control | -5.04 | 20260513-203554-andv-20260513t082956z-full-70f1959a-9p3y-nag-structural-control-pilotmd | queued | 4 |

## Control rationale

- `RIBAVIRIN_control` is used as a broad-spectrum antiviral computational reference because ribavirin has been reported in Andes/hantavirus antiviral studies. It is not treated as a validated docking positive control for 5E04.
- `NAG_structural_control` is used as a glycan-fragment structural control for the exploratory NAG-associated 9P3Y pocket. It is not an antiviral reference compound.

## Outputs

- `selected_ligands_and_controls.csv`
- `md_case_manifest.csv`
- per-system `receptor.pdb`, `ligand_pose.sdf`, `complex_from_docked_pose.pdb`, `md_config.json`, and `manifest.json`

## Limitations

The MD systems start from docking-derived poses or computationally docked controls. Protonation, tautomeric states, force-field parameters, ligand charge assignment, selected pocket definitions, and receptor preparation can materially affect trajectories. Interpret the pilot runs only as computational pose-stability checks.
