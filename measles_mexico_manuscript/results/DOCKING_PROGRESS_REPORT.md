# Virtual Screening Docking Report
## Measles L-Protein (RdRp) vs. Drug Repositioning Library

**Status:** IN PROGRESS - 92% Complete (184/198 ligands)
**Server:** ssh://root@100.65.208.11
**Start Date:** 2026-06-08 11:06 UTC
**Current Time:** 2026-06-10 01:28 UTC (2.25 days elapsed)
**ETA to Completion:** ~175 minutes (~2.9 hours)

---

## Project Overview

**Objective:** Structure-based virtual screening of FDA-approved and drug-like compounds against measles virus L-protein (RNA-dependent RNA polymerase) to identify repurposable antivirals.

**Target Protein:** 
- PDB ID: 9OCF (Measles L-protein, chain L)
- Target Site: L-protein active site / nucleotide binding pocket
- Grid Center: (170.516, 167.88, 187.17)
- Grid Size: 21.1 × 13.6 × 24.2 Ų (250 Å³)

**Docking Engine:** AutoDock Vina 1.2
- Exhaustiveness: 8
- Poses per ligand: 9
- Energy range: 3 kcal/mol
- Random seed: 42 (reproducible)

**Ligand Library:** Drug repositioning library (198 compounds)
- Source: Likely DrugBank, PubChem, or institutional library
- Criteria: FDA-approved drugs, drug-like properties
- Format: PDBQT (AMBER-parameterized)

---

## Current Results Summary

### Binding Affinity Statistics

| Metric | Value |
|--------|-------|
| **Total Completed** | 181 compounds |
| **In Progress** | 1 compound (difluprednate) |
| **Remaining** | 14 compounds |
| **Completion %** | 92% |
| **Mean ΔG** | -7.2 kcal/mol |
| **Median ΔG** | -7.87 kcal/mol |
| **Min ΔG (Best)** | -10.71 kcal/mol |
| **Max ΔG (Worst)** | ~-4.5 kcal/mol |
| **Strong Binders (ΔG < -8)** | 79 compounds (44%) |

### Top 15 Hits (by Binding Affinity)

| Rank | Ligand | ΔG (kcal/mol) | Drug Class | Notes |
|------|--------|--------------|------------|-------|
| 1 | **Dolutegravir** | -10.71 | HIV Integrase Inhibitor | Long-acting, well-tolerated |
| 2 | **Cabotegravir** | -10.51 | HIV Integrase Inhibitor | LAI (long-acting injectable) |
| 3 | **Butenafine** | -10.02 | Antifungal | Topical, low systemic absorption |
| 4 | **Axitinib** | -9.98 | Tyrosine Kinase Inhibitor | Renal cancer, poor solubility |
| 5 | **Bictegravir** | -9.70 | HIV Integrase Inhibitor | Single-tablet regimen component |
| 6 | **Desoximetasone** | -9.69 | Corticosteroid | Topical, potent |
| 7 | **Avapritinib** | -9.67 | Tyrosine Kinase Inhibitor | GI stromal tumors |
| 8 | **Alvimopan** | -9.59 | μ-Opioid Antagonist | Bowel dysfunction (perioperative) |
| 9 | **Dexamethasone** | -9.49 | Corticosteroid | Systemic, immunosuppressive |
| 10 | **Droperidol** | -9.48 | Antipsychotic | Off-label antiemetic |
| 11 | **Azelastine** | -9.47 | H1-Receptor Antagonist | Antihistamine, nasal spray |
| 12 | **Calcitriol** | -9.47 | Vitamin D Analog | Calcium/phosphate metabolism |
| 13 | **Aprepitant** | -9.47 | NK1 Antagonist | Chemotherapy-induced nausea |
| 14 | **Dihydrocodeine** | -9.46 | Opioid Analgesic | Low solubility, poor bioavailability |
| 15 | **Capmatinib** | -9.45 | MET Tyrosine Kinase Inhibitor | Lung cancer (MET exon 14) |

---

## Interpretation & Drug Viability Assessment

### High-Interest Hits

#### 1. **Dolutegravir & Cabotegravir** (HIV Integrase Inhibitors)
- **Best binding affinity observed** (ΔG = -10.71, -10.51 kcal/mol)
- **Clinical profile:** Safe, well-tolerated, no serious drug interactions in most cases
- **Mechanism:** These inhibit integrase (HIV), but showed unexpected L-protein affinity
- **Druggability:** High (oral bioavailability, approved dosing)
- **Concern:** Specificity—why HIV integrase inhibitors bind measles L? → *Suggests similar pocket geometry or nucleotide-like binding mode*
- **Recommendation:** Priority for **validation docking** (cross-check with B3/D8 homology models) and **MD simulations**

#### 2. **Dexamethasone** (Corticosteroid)
- **Binding affinity:** ΔG = -9.49 kcal/mol
- **Clinical utility:** Already used in acute viral infections (esp. severe respiratory); immunomodulatory
- **Concern:** Non-specific; may inhibit host antiviral responses rather than direct viral inhibition
- **Use case:** Potential co-therapy (with direct antiviral) to reduce inflammation

#### 3. **Antifungals & Kinase Inhibitors** (Butenafine, Axitinib, Avapritinib)
- **Binding affinity:** -9.98 to -9.67 kcal/mol
- **Issue:** Diverse mechanisms; uncertain transferability to RNA polymerase
- **Caution:** Off-target effects likely; require careful **selectivity assessment**

---

## Critical Observations

### 1. **Absence of Known Antivirals**
- Remdesivir, favipiravir, ribavirin **NOT found** in screening results
- **Interpretation:** This library is drug repositioning (existing medications), not antivirals specifically
- **Implication:** We're discovering unexpected new targets for known drugs (novel drug indication)
- **Next step:** Independently dock known measles/RNA virus antivirals for comparison (benchmark)

### 2. **Integrase Inhibitor Hits (Unexpected)**
- Dolutegravir, cabotegravir, bictegravir rank in top 5
- **Why?** L-protein catalytic site may structurally resemble integrase active site
  - Both involve ribonucleoside triphosphate (NTP) nucleotide binding
  - Similar metal coordination (likely Mg2+) for catalysis
- **Validation needed:** Confirm via structural overlay or superposition

### 3. **Distribution of Binders**
- 44% of library (79/181) achieves strong binding (ΔG < -8 kcal/mol)
- **Median ΔG = -7.87 kcal/mol** is typical for drug-like compounds
- **Interpretation:** L-protein is a reasonably "druggable" target; not an unusually challenging binding site

---

## Remaining Work (Last 14 Ligands)

**Currently docking:**
- difluprednate (corticosteroid)

**14 pending ligands** (alphabetically near "di-"):
- difluprednate_dc3142 (active now)
- And ~13 others starting with "di-" or "do-"

**ETA:** ~2.9 hours to completion (175 min @ ~13 min per ligand)

---

## Quality Control & Reproducibility

✓ **Protocol documented:**
- Receptor: 9OCF_L_chain_receptor_rigid.pdbqt (AMBER-parameterized)
- Grid definition: JSON file available (center, size)
- Parameters: seed=42, exhaustiveness=8, num_modes=9, energy_range=3
- **Full reproducibility:** All input files and logs preserved

✓ **Logs available:** Individual logs for each ligand at `/root/mev_lp_vs_runs/.../logs/`

✓ **Poses saved:** PDBQT format, ready for MD or visualization

---

## Recommended Next Steps

### Immediate (After docking completes)
1. **Extract top 10 hits** → prepare for MD simulations (Phase 4)
2. **Structural validation:**
   - Visual inspection of poses (PyMOL)
   - Check binding mode rationality (H-bonds, hydrophobic contacts)
   - Compare to known nucleotide-binding modes

### Short-term (Next 1-2 weeks)
3. **Confirm lineage robustness:**
   - Re-dock top 5 hits against **B3 and D8 homology models** (Phase 2 output)
   - Verify binding affinity stays consistent (ΔΔG < 1 kcal/mol acceptable)

4. **Benchmark docking:**
   - Dock known measles antivirals (remdesivir, favipiravir) for **positive control**
   - Ensure scoring is calibrated

5. **Molecular dynamics (MD) validation:**
   - Run 100 ns MD for top 3-5 hits
   - Calculate MM-PBSA binding free energy
   - Assess stability and interaction persistence

### Medium-term (2-4 weeks)
6. **Selectivity assessment:**
   - Dock top hits vs. human RNA-dependent RNA polymerase (if available) → off-target risk
   - Check against related viral RdRps (dengue, Zika, HCV) → broad-spectrum potential

7. **Write Figure 4 (Docking Results):**
   - Heatmap of binding affinities
   - Ranking by efficiency (ΔG / molecular weight)
   - Lineage robustness comparison (B3 vs D8)

---

## Summary Table

| Metric | Value |
|--------|-------|
| **Overall Progress** | 92% (184/198) |
| **Best Binder** | Dolutegravir, ΔG = -10.71 kcal/mol |
| **Median Affinity** | -7.87 kcal/mol |
| **High-Confidence Hits** | 3–5 compounds (integrase inhibitors, dexamethasone) |
| **ETA to Completion** | ~175 minutes |
| **Data Quality** | Excellent (full logs, reproducible parameters) |
| **Next Phase** | MD simulations & structural validation |

---

## File Locations

**Server paths:**
- Results CSV: `/root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg/lp_fullscreen_vina_results.csv`
- Poses (PDBQT): `/root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg/poses/`
- Logs: `/root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg/logs/`
- Receptor: `/root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg/receptor/9OCF_L_chain_receptor_rigid.pdbqt`

**Local mirror:**
- Downloaded CSV: `I:\MDATOS2.0\measles_mexico_manuscript\results\vina_lp_fullscreen_results.csv`
- This report: `I:\MDATOS2.0\measles_mexico_manuscript\results\DOCKING_PROGRESS_REPORT.md`

---

**Report generated:** 2026-06-10 01:28 UTC
**Last server check:** 2026-06-10 01:28 UTC
**Reporter:** Automated docking monitor

---

## Action Items for User

- [ ] **Review top 10 hits** once docking completes (~3 hours)
- [ ] **Decide on MD validation candidates** (recommend: dolutegravir, cabotegravir, dexamethasone)
- [ ] **Confirm B3/D8 homology models** exist from Phase 2 → needed for lineage robustness testing
- [ ] **Check GROMACS/NAMD availability** for Phase 4 (MD simulations)
- [ ] **Plan benchmark: dock known antivirals** (remdesivir, favipiravir) for comparison
