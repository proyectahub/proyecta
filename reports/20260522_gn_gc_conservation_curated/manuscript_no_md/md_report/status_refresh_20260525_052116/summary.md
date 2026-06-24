# ANDV MD status refresh 2026-05-25 05:21:16

- Direct SSH verification of `root@100.65.208.11:/home/svirology/gromacs_desktop_ui/runtime/jobs` was again blocked in-session because `ssh` resolves to the sandbox deny-wrapper at `C:\Users\fidel\.sbx-denybin\ssh.bat`.
- This run therefore re-used the latest cached queue snapshot already archived locally and copied into this refresh folder for provenance continuity.
- Relative to the prior refresh at `2026-05-25 04:21:49`, no new queue-state changes were detected for the incomplete control/apo focus set: `20260524-111618-andv-5e04-apo-protein-50ns-md` remains queue-complete without local apo-analysis exports, and `20260524-111618-andv-9p3y-apo-protein-50ns-md` remains `partial_setup`.
- No new local apo-specific `xvg`, `csv`, or `png` outputs were found in the publication package, so the manuscript markdown and timestamped DOCX set were left unchanged in this run.
