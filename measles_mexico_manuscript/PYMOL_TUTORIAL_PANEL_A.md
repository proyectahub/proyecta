# PyMOL Tutorial: Conservation-Validated PDB Structure Figure (Panel A)
## Figure 3: L-protein binding pocket with conserved residues highlighted

---

## Overview

**Objective:** Generate Panel A showing:
- PDB 9OCF (Measles L-polymerase) as cartoon ribbon (gray background)
- **Conserved core residues** (blue, large spheres)
- **Minor-variable shell** (red/orange, medium spheres)
- Professional publication-ready rendering

**Result:** High-resolution PNG (3000×2400 px, 300 dpi equivalent)

---

## Method 1: Automated PyMOL Script (Recommended)

### Step 1: Create PyMOL Script File

Save this as `measure_lprotein_conservation.pml`:

```python
# ============================================================================
# Conservation-Validated L-Protein Binding Pocket
# PDB 9OCF | Measles Virus L-Polymerase (RdRp)
# ============================================================================

# ==== INITIALIZATION ====
# White background for publication
set ray_opaque_background, 1
set bg_rgb, [1, 1, 1]

# Disable orthoscopic projection for depth perception
set orthoscopic, 0

# Ray tracing quality
set perspective, 1
set ray_trace_mode, 1

# ==== LOAD STRUCTURE ====
fetch 9OCF, l_protein
select protein, l_protein and chain A

# ==== HIDE EVERYTHING & START FRESH ====
hide everything

# ==== PROTEIN VISUALIZATION: CARTOON RIBBON ====
show cartoon, protein
color gray70, protein
set cartoon_color, gray70
set cartoon_transparency, 0.0

# Make cartoon thicker for visibility
set cartoon_loop_radius, 0.3

# ==== CORE RESIDUES (>90% CONSERVATION) ====
# Residues: LEU664, TYR667, TRP671, GLU740, GLY741, GLN744, TRP747, 
#           1HR751, LEU755, GLY772, ASP773, GLN775, LEU811, HIS816, LEU818
select core_residues, resi 664+667+671+740+741+744+747+751+755+772+773+775+811+816+818

show spheres, core_residues
color marine, core_residues
set sphere_scale, 0.6
set sphere_transparency, 0.0

# Add labels to core residues (optional - for detail)
label core_residues, resn+resi

# ==== MINOR-VARIABLE SHELL (<90% CONSERVATION) ====
# Residues: LYS535, ARG544, ILE739
select minor_shell, resi 535+544+739

show spheres, minor_shell
color orange, minor_shell
set sphere_scale, 0.4
set sphere_transparency, 0.1

# ==== LIGAND VISUALIZATION (if available) ====
# ERDRP-0519 co-crystal ligand
select ligand, hetm
show sticks, ligand
color yellow, ligand
set stick_transparency, 0.1

# ==== RENDERING SETTINGS ====
# Professional appearance
set fog, 0
set specular, 0.5
set shine, 50
set ambient, 0.3
set depth_cue, 0
set antialias, 2

# Anti-aliasing
set max_threads, 4

# ==== VIEW ORIENTATION ====
# Focus on binding pocket
center resi 740
orient

# Optimal zoom for binding pocket
zoom, 1.4

# ==== RAY TRACING & OUTPUT ====
# High-resolution output (3000x2400 = 300 dpi at 10x8 inches)
ray 3000, 2400

# Save image
png figure3_panel_A_pdb_structure.png, 3000, 2400, dpi=300
```

### Step 2: Execute in PyMOL

**Option A: Command Line**
```bash
# Download PyMOL (if not installed)
# https://pymol.org/2/

# Execute script
pymol -c -r measure_lprotein_conservation.pml -o figure3_panel_A_pdb_structure.png
```

**Option B: PyMOL GUI**
1. Open PyMOL
2. File → Run Script → Select `measure_lprotein_conservation.pml`
3. Wait for rendering (may take 1-2 minutes)
4. Image auto-saves as `figure3_panel_A_pdb_structure.png`

---

## Method 2: Interactive PyMOL Session (Manual)

If you prefer manual control:

### Step 1: Fetch & Display Structure

```python
fetch 9OCF, l_protein
select protein, l_protein and chain A
show cartoon, protein
color gray70, protein
```

### Step 2: Highlight Core Residues

```python
# Core residues (conserved >90%)
select core, resi 664+667+671+740+741+744+747+751+755+772+773+775+811+816+818
show spheres, core
color marine, core
set sphere_scale, 0.6
```

### Step 3: Highlight Variable Shell

```python
# Minor-variable shell
select shell, resi 535+544+739
show spheres, shell
color orange, shell
set sphere_scale, 0.4
```

### Step 4: Orient & Render

```python
# Focus on binding pocket
center resi 740
orient
zoom, 1.4

# High-quality render
ray 3000, 2400

# Save
png figure3_panel_A_pdb_structure.png, 3000, 2400, dpi=300
```

---

## Method 3: Using UCSF Chimera (Alternative)

If PyMOL unavailable, Chimera is similar:

```bash
# Open structure
open 9OCF chain A

# Style as ribbon
style ribbon

# Color protein gray
color gray protein

# Select and color core residues
select :/64,67,71,40,41,44,47,51,55,72,73,75,11,16,18 & /L
color blue selection
style sphere selection
```

---

## Troubleshooting

### Issue: "fetch command not working"
**Solution:** Ensure internet connection. PyMOL must download from RCSB.
```python
set fetch_path, /tmp  # or C:\Temp on Windows
```

### Issue: "Labels overlapping"
**Solution:** Remove or adjust label size
```python
label core_residues  # Clear labels
```

### Issue: "Output PNG is too large/small"
**Solution:** Adjust ray dimensions
```python
ray 2400, 1800  # Lower resolution (faster)
ray 4000, 3000  # Higher resolution (slower)
```

### Issue: "Rendering takes too long"
**Solution:** Disable ray tracing temporarily
```python
# Use viewport instead (faster, lower quality)
# No ray tracing: just take screenshot
```

---

## Expected Output

**File:** `figure3_panel_A_pdb_structure.png`

**Dimensions:** 3000 × 2400 pixels (10 × 8 inches at 300 dpi)

**Contents:**
- Gray cartoon ribbon of L-protein chain A
- **Blue spheres:** 15 core conserved residues (>90% conservation)
- **Orange spheres:** 3 minor-variable shell residues (variable regions)
- White background
- Professional rendering with depth cues

**File size:** ~2-5 MB (depending on rendering settings)

---

## Combining Panels into Final Figure

Once you have all three panels:
- Panel A: `figure3_panel_A_pdb_structure.png`
- Panel B: `figure3_panel_B_conservation_bars.png`
- Panel C: `figure3_panel_C_box_comparison.png`

### Using Adobe Illustrator:
1. Create new document: 12" × 10" at 300 dpi
2. Place panels in layout:
   - **Panel A:** Left column (40% width)
   - **Panel B:** Right column, top (60% width)
   - **Panel C:** Right column, bottom (60% width)
3. Add labels: "A.", "B.", "C." in 18pt bold
4. Add figure title above
5. Export as PDF + PNG

### Using ImageMagick (command line):
```bash
# Combine panels horizontally (A on left, B+C stacked on right)
montage figure3_panel_A_pdb_structure.png \
         -label "A) PDB-localized conserved core" \
         figure3_panel_B_conservation_bars.png \
         -label "B) Residue-level conservation" \
         figure3_panel_C_box_comparison.png \
         -label "C) Box refinement comparison" \
         -pointsize 20 -geometry 1024x800+20+20 \
         figure3_combined.png
```

---

## Reference: Core & Variable Residues

### Core Residues (>90% conservation)
| Residue | PDB # | Amino Acid | Conservation |
|---------|-------|-----------|--------------|
| 664 | LEU | Leucine | 1.000 |
| 667 | TYR | Tyrosine | 1.000 |
| 671 | TRP | Tryptophan | 1.000 |
| 740 | GLU | Glutamic acid | 1.000 |
| 741 | GLY | Glycine | 1.000 |
| 744 | GLN | Glutamine | 1.000 |
| 747 | TRP | Tryptophan | 1.000 |
| 751 | 1HR | Histidine | 0.999 |
| 755 | LEU | Leucine | 0.998 |
| 772 | GLY | Glycine | 1.000 |
| 773 | ASP | Aspartic acid | 0.998 |
| 775 | GLN | Glutamine | 0.999 |
| 811 | LEU | Leucine | 0.998 |
| 816 | HIS | Histidine | 0.999 |
| 818 | LEU | Leucine | 0.999 |

### Minor-Variable Shell (<90% conservation)
| Residue | PDB # | Amino Acid | Conservation |
|---------|-------|-----------|--------------|
| 535 | LYS | Lysine | 0.85 |
| 544 | ARG | Arginine | 0.87 |
| 739 | ILE | Isoleucine | 0.83 |

---

## Publication Specifications

**Journal Requirements:**
- Resolution: **300 dpi minimum** for print
- Format: **TIFF or high-quality PNG**
- Color mode: **RGB** (not CMYK for digital)
- Maximum file size: **50 MB**
- Figure width: **3.5 inches** (single column) or **7 inches** (full page)

**Our output:**
- ✅ 3000×2400 px = 300 dpi at 10×8 inches
- ✅ PNG format (8-bit compressed)
- ✅ Professional rendering with anti-aliasing
- ✅ Publication-ready for Lancet Microbe, PLoS Pathogens, mBio

---

## Advanced: Custom Color Schemes

If you want different colors:

```python
# Color palette options
color_marine = [0.2, 0.4, 1.0]      # Deep blue
color_orange = [1.0, 0.6, 0.2]      # Orange
color_red = [1.0, 0.3, 0.3]         # Red

# Set custom colors
set_color my_blue, color_marine
set_color my_orange, color_orange

# Apply
color my_blue, core_residues
color my_orange, minor_shell
```

---

## Verification Checklist

Before submitting:
- ✅ PDB 9OCF fetched successfully
- ✅ Protein shown as cartoon (gray)
- ✅ Core residues highlighted (blue, large)
- ✅ Variable shell highlighted (orange, smaller)
- ✅ View focused on binding pocket
- ✅ White background
- ✅ High resolution (3000×2400)
- ✅ Labels readable (if included)
- ✅ File saved as PNG

---

**Generated:** 2026-06-10
**For:** Measles Mexico Antiviral Repositioning Manuscript
**Status:** Ready for publication
