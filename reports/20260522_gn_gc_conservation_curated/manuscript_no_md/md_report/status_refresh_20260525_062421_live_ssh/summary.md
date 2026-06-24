# ANDV MD status refresh 2026-05-25 06:24:21

- Direct SSH verification was performed against `root@100.65.208.11:/home/svirology/gromacs_desktop_ui/runtime/jobs`.
- The prior cached interpretation that `20260524-111618-andv-5e04-apo-protein-50ns-md` was completed is not supported by the live remote files. On the live check, `md.log` was still advancing and ended at `46.326 ns`, with remote `md.log` mtime `2026-05-25 07:25:31 -0600`.
- Even though `5E04-apo` is still running, its remote `analysis/` directory already contains usable protein-only descriptor files (`rmsd.xvg`, `rmsf.xvg`, `gyrate.xvg`, `sasa.xvg`, `density.xvg`, `pressure.xvg`, `temperature.xvg`, and `potential.xvg`). Those files were copied into this refresh folder for provenance and possible later local analysis.
- `20260524-111618-andv-9p3y-apo-protein-50ns-md` remains queued, with `status.json` and `run.log` mtime `2026-05-25 07:25:26 -0600`, and still has no production artifacts.
- Because the new apo-side artifacts are partial rather than final, the manuscript was revised conservatively: it now describes `5E04-apo` as an in-progress receptor-only control with archived remote protein-only outputs, and it keeps the receptor-only comparison frame incomplete until `5E04-apo` finishes and `9P3Y-apo` progresses beyond queue state.
