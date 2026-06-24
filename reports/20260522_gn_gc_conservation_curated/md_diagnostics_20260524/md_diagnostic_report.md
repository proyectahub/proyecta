# Molecular dynamics diagnostic report
Snapshot time (UTC): `2026-05-24T08:38:26.772425+00:00`
## Queue summary
- Active count: **2**
- Queued count: **1**
- GPU-exclusive scheduling: **True**
- Manual resume detected: **True**

![Combined MD diagnostic figure](md_diagnostic_combined_figure.png)

## Job status table
| System | Status | Progress | Finished / ETA | XTC output | Last progress line |
|---|---:|---:|---|---:|---|
| 9P3Y-GRANISETRON candidate | completed | 100.0% | 2026-05-23T23:20:24+00:00 | 3.08 GB | `Writing checkpoint, step 25000000 at Sat May 23 17:20:24 2026` |
| 5E04-RIBAVIRIN control | completed | 100.0% | 2026-05-24T06:26:07+00:00 | 8.25 GB | `Writing checkpoint, step 25000000 at Sun May 24 00:26:07 2026` |
| 5E04-PAROXETINE repeat | running_md | 100.0% | pending | 2.38 GB | `Writing checkpoint, step 7346320 at Sun May 24 02:38:04 2026` |
| 9P3Y-NAG structural control | queued | 0.0% | pending | 0.00 GB | `` |

## Diagnostic interpretation
- **9P3Y/granisetron** is completed and has a trajectory file available for analysis.
- **5E04/ribavirin control** is completed and its status/log were copied locally.
- **5E04/paroxetine repeat** remains active on the GPU; the latest mdrun process is healthy and should not be interrupted. The status file reports 100%, but the active process and last mdrun line show it is still finalizing/running.
- **9P3Y/NAG structural control** is queued and should start after the active GPU job releases the exclusive slot.

## GPU snapshot
- GPU: **NVIDIA GeForce RTX 5080**
- Utilization: **57.0%**
- Memory: **3657/16303 MB**
- Temperature: **60 C**

## Files generated
- `md_job_status_table.csv`
- `gpu_status_table.csv`
- `md_diagnostic_combined_figure.png`
- `remote_status_raw.txt`

## Conservative reporting note
These diagnostics describe simulation execution status and file availability only. They do not establish ligand stability, binding affinity, antiviral activity, or experimental validation.
