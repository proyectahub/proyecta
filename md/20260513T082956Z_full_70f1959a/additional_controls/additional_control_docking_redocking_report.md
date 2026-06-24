# Additional docking/redocking controls for MD

Run bundle: `20260513T082956Z_full_70f1959a`

These controls are computational references only and do not establish antiviral efficacy, experimental binding, or safety. Extra MD jobs were submitted: `False`.

| Receptor | Ligand/control | Control type | Vina score (kcal/mol) |
|---|---|---|---:|
| 5E04 | RIBAVIRIN_control | computational antiviral reference | -6.181 |
| 9P3Y | RIBAVIRIN_control | computational antiviral reference | -5.281 |
| 5E04 | FAVIPIRAVIR_control | computational antiviral reference | -6.171 |
| 9P3Y | FAVIPIRAVIR_control | computational antiviral reference | -4.274 |
| 5E04 | REMDESIVIR_control | computational antiviral reference | -7.395 |
| 9P3Y | REMDESIVIR_control | computational antiviral reference | -6.605 |
| 9P3Y | NAG_crystallographic_redock | self-redocking structural control | -4.47 |

## Redocking note

The 9P3Y redocking control used the crystallographic NAG residue nearest the configured site_1 center. Metadata: `{"source_key": ["Y", "A", "701"], "centroid": [147.0192857142857, 138.29207142857143, 161.61335714285715], "distance_to_box_center_angstrom": 1.4649860311377025, "atom_count": 14}`. RMSD validation is not claimed here because the prepared receptor and the Vina ligand conversion alter hydrogens/protonation and atom typing; this is a structural-control pose generation step for MD only.

## MD readiness

Each case contains `receptor.pdb`, `ligand_pose.sdf`, `complex_from_control_pose.pdb`, `md_config.json`, and `manifest.json` under `/home/svirology/andv_md_inputs/20260513T082956Z_full_70f1959a/additional_controls/md_cases`.
