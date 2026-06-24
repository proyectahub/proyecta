# Molecular-dynamics completion update for manuscript integration

Diagnostic snapshot: `2026-05-24T18:34:50.601775+00:00`.

## Completed simulations

| System | Status | Finished UTC | Return code | XTC trajectory | EDR | Interpretation status |
|---|---:|---|---:|---:|---:|---|
| 5E04-PAROXETINE candidate repeat | completed | 2026-05-24T13:50:35+00:00 | 0 | 8.09 GB | 15.16 MB | available for downstream trajectory analysis; not evidence of binding or antiviral activity |
| 5E04-RIBAVIRIN reference control | completed | 2026-05-24T06:26:07+00:00 | 0 | 8.25 GB | 15.16 MB | available for downstream trajectory analysis; not evidence of binding or antiviral activity |
| 9P3Y-GRANISETRON candidate | completed | 2026-05-23T23:20:24+00:00 | 0 | 3.08 GB | 3.09 MB | available for downstream trajectory analysis; not evidence of binding or antiviral activity |

## Simulations still in progress or queued

| System | Status | Current output | Manuscript role |
|---|---:|---:|---|
| 9P3Y-NAG structural control | running_md | 7.00 GB | structural/redocking control |
| 5E04 apo-receptor | queued | 0.00 GB | apo-receptor baseline control |
| 9P3Y apo-receptor | queued | 0.00 GB | apo-receptor baseline control |

![MD completion summary](md_completed_status_manuscript_figure.png)

## Manuscript-ready Results text

Molecular-dynamics simulations were used as a downstream computational follow-up for the branch-specific docked complexes and reference controls. At the present analysis checkpoint, three 50 ns production trajectories had completed successfully: the 5E04/paroxetine candidate repeat, the 5E04/ribavirin reference-control system, and the 9P3Y/granisetron candidate system. Each completed job produced the expected GROMACS production artifacts, including compressed trajectory (`md.xtc`), energy (`md.edr`), checkpoint (`md.cpt`), portable binary run input (`md.tpr`), production log (`md.log`), and final coordinate (`md.gro`) files. These outputs indicate successful numerical completion of the production runs and provide analyzable trajectories for subsequent RMSD, RMSF, radius-of-gyration, protein-ligand contact, hydrogen-bond, distance, and energy-stability summaries.

The completed trajectories were interpreted strictly as computational structural follow-up. The 5E04/paroxetine simulation supports evaluation of the nucleoprotein-branch docking hypothesis relative to a 5E04/ribavirin computational reference control, whereas the 9P3Y/granisetron simulation supports evaluation of the exploratory glycoprotein-branch hypothesis. Completion of these simulations does not demonstrate binding affinity, antiviral activity, safety, or therapeutic relevance. Rather, the trajectories provide time-resolved structural models that can be compared against apo-receptor and structural-control simulations as those additional jobs complete.

At this checkpoint, the 9P3Y/NAG structural-control simulation was still in progress, and two apo-receptor baseline simulations had been queued: 5E04 apo-protein and 9P3Y apo-protein. These apo systems are included to distinguish ligand-associated local fluctuations from receptor-intrinsic mobility. The molecular-dynamics section of the manuscript should therefore be treated as a living section: completed candidate/control trajectories can be summarized now, whereas final comparative interpretation should be updated after the NAG and apo-receptor trajectories finish and pass quality-control checks.

## Manuscript-ready Methods text

Production molecular dynamics was conducted for selected docked systems using GROMACS 2025.3 with GPU acceleration where available. Systems were prepared with the AMBER99SB-ILDN protein force field, TIP3P water, a dodecahedral solvent box with 1.0 nm padding, and 0.15 M salt neutralization. Energy minimization was followed by NVT and NPT equilibration before 50 ns production dynamics. Production runs used particle-mesh Ewald electrostatics, hydrogen-bond constraints, a 2 fs production timestep, V-rescale temperature coupling, Parrinello-Rahman pressure coupling for production, and GPU-accelerated nonbonded and PME calculations where supported. Small-molecule systems were parameterized with the local ACPYPE/GAFF2 workflow for ligand-containing simulations.

Apo-receptor simulations were queued as receptor-intrinsic baselines and are intended to support comparison of receptor mobility in ligand-bound and ligand-free contexts. The analyses are computational only and were not used to infer experimental binding affinity or antiviral efficacy.

## Current conclusion for manuscript draft

The molecular-dynamics dataset is partially complete. The available completed trajectories are sufficient to document that branch-specific candidate and reference-control systems reached production completion, but a final comparative MD interpretation should wait until the NAG structural-control and apo-receptor baseline trajectories complete.
