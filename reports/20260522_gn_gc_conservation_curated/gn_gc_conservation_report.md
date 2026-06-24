# Gn/Gc conservation mapping across representative orthohantaviruses

Generated: 2026-05-23T05:39:40+00:00 UTC

## Scope and interpretation

This report is a strictly computational sequence-conservation analysis of hantavirus M-segment glycoprotein precursor (GPC) proteins, with estimated mapping to Gn and Gc using a WAASA-like cleavage motif when detectable. It does not infer infectivity, pathogenicity, immune escape, or experimental function. Conserved residues should be interpreted as hypotheses for structural/functional prioritization only.

## Methods

- Protein sequences were retrieved from NCBI Protein using glycoprotein/GPC queries for each virus name.
- One representative complete GPC-like protein was selected per virus by title, length, completeness, and RefSeq-like accession preference.
- Sequences were aligned with MAFFT.
- Per-column identity, gap fraction, Shannon entropy, and pairwise identity were calculated.
- Gn/Gc boundaries were estimated by detecting WAASA-like motifs in the unaligned GPC sequences. The boundary is approximate and should be replaced by curated annotations for final publication if available.

## Missing or unresolved viruses

- SAAV Saaremaa orthohantavirus

## Sequence set

| Virus   | Name                                        | Accession      |   Length aa | Description                                                                                                              |
|:--------|:--------------------------------------------|:---------------|------------:|:-------------------------------------------------------------------------------------------------------------------------|
| ANDV    | Andes orthohantavirus                       | NP_604472.1    |        1138 | NP_604472.1 G1 and G2 surface glycoprotein precursor [Orthohantavirus andesense]                                         |
| SNV     | Sin Nombre orthohantavirus                  | NP_941974.1    |        1140 | NP_941974.1 glycoprotein precursor [Orthohantavirus sinnombreense]                                                       |
| HTNV    | Hantaan orthohantavirus                     | BAK08371.1     |        1135 | BAK08371.1 glycoprotein precursor [Orthohantavirus hantanense]                                                           |
| PUUV    | Puumala orthohantavirus                     | XNO10649.1     |        1148 | XNO10649.1 glycoprotein precursor [Orthohantavirus puumalaense]                                                          |
| SEOV    | Seoul orthohantavirus                       | AAL66175.1     |        1133 | AAL66175.1 glycoprotein precursor [Seoulvirus IR461]                                                                     |
| DOBV    | Dobrava-Belgrade orthohantavirus            | NP_942554.1    |        1135 | NP_942554.1 glycoprotein precursor (G1-G2) [Orthohantavirus dobravaense]                                                 |
| TULV    | Tula orthohantavirus                        | WWQ85471.1     |        1141 | WWQ85471.1 glycoprotein precursor [Orthohantavirus tulaense]                                                             |
| PHV     | Prospect Hill orthohantavirus               | GP_PHV         |        1142 | sp|P27315.1|GP_PHV RecName: Full=Envelopment polyprotein; AltName: Full=M polyprotein; Contains: RecName: Full=Glycoprot |
| BAYV    | Bayou orthohantavirus                       | YP_009505597.1 |        1141 | YP_009505597.1 glycoprotein precursor [Orthohantavirus bayoui]                                                           |
| BCCV    | Black Creek Canal orthohantavirus           | GP_BCCV        |        1141 | sp|P0DTJ0.1|GP_BCCV RecName: Full=Envelopment polyprotein; AltName: Full=Glycoprotein precursor; AltName: Full=M polypro |
| THAIV   | Thailand/Anjozorobe-related orthohantavirus | YP_009362289.1 |        1133 | YP_009362289.1 glycoprotein precursor [Anjozorobe virus]                                                                 |
| AMRV    | Amur orthohantavirus                        | AGE13901.1     |        1135 | AGE13901.1 glycoprotein precursor [Amur virus]                                                                           |

## Estimated Gn/Gc cleavage motif mapping

| motif   |   motif_start |   split_after |   gn_length_est |   gc_length_est | method                     | short   | virus_name                                  | accession      |   length |
|:--------|--------------:|--------------:|----------------:|----------------:|:---------------------------|:--------|:--------------------------------------------|:---------------|---------:|
| WAASA   |           647 |           651 |             651 |             487 | WAASA-like motif heuristic | ANDV    | Andes orthohantavirus                       | NP_604472.1    |     1138 |
| WAASA   |           648 |           652 |             652 |             488 | WAASA-like motif heuristic | SNV     | Sin Nombre orthohantavirus                  | NP_941974.1    |     1140 |
| WAASA   |           644 |           648 |             648 |             487 | WAASA-like motif heuristic | HTNV    | Hantaan orthohantavirus                     | BAK08371.1     |     1135 |
| WAASA   |           654 |           658 |             658 |             490 | WAASA-like motif heuristic | PUUV    | Puumala orthohantavirus                     | XNO10649.1     |     1148 |
| WAASA   |           642 |           646 |             646 |             487 | WAASA-like motif heuristic | SEOV    | Seoul orthohantavirus                       | AAL66175.1     |     1133 |
| WAASA   |           644 |           648 |             648 |             487 | WAASA-like motif heuristic | DOBV    | Dobrava-Belgrade orthohantavirus            | NP_942554.1    |     1135 |
| WAASA   |           649 |           653 |             653 |             488 | WAASA-like motif heuristic | TULV    | Tula orthohantavirus                        | WWQ85471.1     |     1141 |
| WAASA   |           650 |           654 |             654 |             488 | WAASA-like motif heuristic | PHV     | Prospect Hill orthohantavirus               | GP_PHV         |     1142 |
| WAASA   |           650 |           654 |             654 |             487 | WAASA-like motif heuristic | BAYV    | Bayou orthohantavirus                       | YP_009505597.1 |     1141 |
| WAASA   |           650 |           654 |             654 |             487 | WAASA-like motif heuristic | BCCV    | Black Creek Canal orthohantavirus           | GP_BCCV        |     1141 |
| WAASA   |           642 |           646 |             646 |             487 | WAASA-like motif heuristic | THAIV   | Thailand/Anjozorobe-related orthohantavirus | YP_009362289.1 |     1133 |
| WAASA   |           644 |           648 |             648 |             487 | WAASA-like motif heuristic | AMRV    | Amur orthohantavirus                        | AGE13901.1     |     1135 |

## Regional conservation summary

| ANDV_region_estimate   |   n_alignment_columns |   mean_identity_percent |   median_identity_percent |   mean_gap_percent |   mean_entropy_norm |
|:-----------------------|----------------------:|------------------------:|--------------------------:|-------------------:|--------------------:|
| Gc_estimated           |                   487 |                   78.17 |                     91.67 |               0.09 |               0.159 |
| Gn_estimated           |                   651 |                   70.06 |                     66.67 |               0.35 |               0.224 |

## Pairwise identity matrix (%)

|       |   ANDV |   SNV |   HTNV |   PUUV |   SEOV |   DOBV |   TULV |   PHV |   BAYV |   BCCV |   THAIV |   AMRV |
|:------|-------:|------:|-------:|-------:|-------:|-------:|-------:|------:|-------:|-------:|--------:|-------:|
| ANDV  |  100   |  77.9 |   55.3 |   66.2 |   53.9 |   54.2 |   68   |  66.7 |   75.8 |   75.4 |    54.9 |   55.3 |
| SNV   |   77.9 | 100   |   55.4 |   67.5 |   52.8 |   54.1 |   68.8 |  67.7 |   80.9 |   80.1 |    53.8 |   55.4 |
| HTNV  |   55.3 |  55.4 |  100   |   54.2 |   76   |   76.8 |   55.3 |  54.3 |   55.5 |   54.7 |    77.4 |   92.1 |
| PUUV  |   66.2 |  67.5 |   54.2 |  100   |   54.2 |   53.8 |   79.4 |  76.2 |   65.3 |   65.7 |    53.8 |   54.4 |
| SEOV  |   53.9 |  52.8 |   76   |   54.2 |  100   |   77.2 |   54.5 |  53.7 |   54.1 |   53.5 |    82.3 |   75.9 |
| DOBV  |   54.2 |  54.1 |   76.8 |   53.8 |   77.2 |  100   |   54.6 |  53.4 |   54.5 |   53.6 |    77.2 |   77.1 |
| TULV  |   68   |  68.8 |   55.3 |   79.4 |   54.5 |   54.6 |  100   |  80.1 |   67.8 |   68   |    54.3 |   54.1 |
| PHV   |   66.7 |  67.7 |   54.3 |   76.2 |   53.7 |   53.4 |   80.1 | 100   |   66.4 |   65.3 |    53.8 |   54.4 |
| BAYV  |   75.8 |  80.9 |   55.5 |   65.3 |   54.1 |   54.5 |   67.8 |  66.4 |  100   |   88.5 |    54.2 |   55.2 |
| BCCV  |   75.4 |  80.1 |   54.7 |   65.7 |   53.5 |   53.6 |   68   |  65.3 |   88.5 |  100   |    53.4 |   54.5 |
| THAIV |   54.9 |  53.8 |   77.4 |   53.8 |   82.3 |   77.2 |   54.3 |  53.8 |   54.2 |   53.4 |   100   |   76.8 |
| AMRV  |   55.3 |  55.4 |   92.1 |   54.4 |   75.9 |   77.1 |   54.1 |  54.4 |   55.2 |   54.5 |    76.8 |  100   |

## Figures

### Conservation profile

![Conservation profile](andv_referenced_conservation_profile.png)

### Entropy profile

![Entropy profile](andv_referenced_entropy_profile.png)

### Pairwise identity heatmap

![Pairwise identity heatmap](pairwise_identity_heatmap.png)

### Gn versus Gc conservation

![Gn versus Gc conservation](gn_gc_conservation_boxplot.png)

### Smoothed conservation landscape

![Smoothed conservation landscape](rolling_conservation_landscape.png)

### Top conserved sites

![Top conserved sites](top_conserved_andv_sites.png)

## Highly conserved ANDV-referenced positions

| ANDV_site   | ANDV_region_estimate   |   alignment_pos | consensus_residue   |   identity_percent |   gap_percent |   non_gap_count |
|:------------|:-----------------------|----------------:|:--------------------|-------------------:|--------------:|----------------:|
| C30         | Gn_estimated           |              35 | C                   |                100 |             0 |              12 |
| P31         | Gn_estimated           |              36 | P                   |                100 |             0 |              12 |
| H32         | Gn_estimated           |              37 | H                   |                100 |             0 |              12 |
| G37         | Gn_estimated           |              42 | G                   |                100 |             0 |              12 |
| G43         | Gn_estimated           |              48 | G                   |                100 |             0 |              12 |
| E61         | Gn_estimated           |              66 | E                   |                100 |             0 |              12 |
| S62         | Gn_estimated           |              67 | S                   |                100 |             0 |              12 |
| S63         | Gn_estimated           |              68 | S                   |                100 |             0 |              12 |
| C64         | Gn_estimated           |              69 | C                   |                100 |             0 |              12 |
| D67         | Gn_estimated           |              72 | D                   |                100 |             0 |              12 |
| H69         | Gn_estimated           |              74 | H                   |                100 |             0 |              12 |
| W83         | Gn_estimated           |              88 | W                   |                100 |             0 |              12 |
| F100        | Gn_estimated           |             105 | F                   |                100 |             0 |              12 |
| G111        | Gn_estimated           |             116 | G                   |                100 |             0 |              12 |
| C113        | Gn_estimated           |             118 | C                   |                100 |             0 |              12 |
| C132        | Gn_estimated           |             140 | C                   |                100 |             0 |              12 |
| D134        | Gn_estimated           |             142 | D                   |                100 |             0 |              12 |
| L135        | Gn_estimated           |             143 | L                   |                100 |             0 |              12 |
| C137        | Gn_estimated           |             145 | C                   |                100 |             0 |              12 |
| N138        | Gn_estimated           |             146 | N                   |                100 |             0 |              12 |
| T140        | Gn_estimated           |             148 | T                   |                100 |             0 |              12 |
| C142        | Gn_estimated           |             150 | C                   |                100 |             0 |              12 |
| P144        | Gn_estimated           |             152 | P                   |                100 |             0 |              12 |
| T145        | Gn_estimated           |             153 | T                   |                100 |             0 |              12 |
| P151        | Gn_estimated           |             159 | P                   |                100 |             0 |              12 |
| C155        | Gn_estimated           |             163 | C                   |                100 |             0 |              12 |
| C161        | Gn_estimated           |             169 | C                   |                100 |             0 |              12 |
| R169        | Gn_estimated           |             177 | R                   |                100 |             0 |              12 |
| Q171        | Gn_estimated           |             179 | Q                   |                100 |             0 |              12 |
| Y174        | Gn_estimated           |             182 | Y                   |                100 |             0 |              12 |
| E175        | Gn_estimated           |             183 | E                   |                100 |             0 |              12 |
| T177        | Gn_estimated           |             185 | T                   |                100 |             0 |              12 |
| C179        | Gn_estimated           |             187 | C                   |                100 |             0 |              12 |
| G182        | Gn_estimated           |             190 | G                   |                100 |             0 |              12 |
| L184        | Gn_estimated           |             192 | L                   |                100 |             0 |              12 |
| E186        | Gn_estimated           |             194 | E                   |                100 |             0 |              12 |
| G187        | Gn_estimated           |             195 | G                   |                100 |             0 |              12 |
| C189        | Gn_estimated           |             197 | C                   |                100 |             0 |              12 |
| F190        | Gn_estimated           |             198 | F                   |                100 |             0 |              12 |
| P192        | Gn_estimated           |             200 | P                   |                100 |             0 |              12 |
| C214        | Gn_estimated           |             222 | C                   |                100 |             0 |              12 |
| F215        | Gn_estimated           |             223 | F                   |                100 |             0 |              12 |
| K220        | Gn_estimated           |             228 | K                   |                100 |             0 |              12 |
| K225        | Gn_estimated           |             236 | K                   |                100 |             0 |              12 |
| Y247        | Gn_estimated           |             259 | Y                   |                100 |             0 |              12 |
| Y248        | Gn_estimated           |             260 | Y                   |                100 |             0 |              12 |
| C250        | Gn_estimated           |             262 | C                   |                100 |             0 |              12 |
| G253        | Gn_estimated           |             265 | G                   |                100 |             0 |              12 |
| S256        | Gn_estimated           |             268 | S                   |                100 |             0 |              12 |
| P262        | Gn_estimated           |             274 | P                   |                100 |             0 |              12 |
| D266        | Gn_estimated           |             278 | D                   |                100 |             0 |              12 |
| R268        | Gn_estimated           |             280 | R                   |                100 |             0 |              12 |
| P280        | Gn_estimated           |             292 | P                   |                100 |             0 |              12 |
| G282        | Gn_estimated           |             294 | G                   |                100 |             0 |              12 |
| E283        | Gn_estimated           |             295 | E                   |                100 |             0 |              12 |
| D284        | Gn_estimated           |             296 | D                   |                100 |             0 |              12 |
| H285        | Gn_estimated           |             297 | H                   |                100 |             0 |              12 |
| D286        | Gn_estimated           |             298 | D                   |                100 |             0 |              12 |
| I297        | Gn_estimated           |             309 | I                   |                100 |             0 |              12 |
| G299        | Gn_estimated           |             311 | G                   |                100 |             0 |              12 |

## Regional alignments of interest

The following regional alignments were extracted from the MAFFT GPC alignment and referenced to ANDV residue numbering. Regions include the WAASA-like Gn/Gc junction, automatically selected high-conservation windows, the estimated N-terminal Gc region, and the C-terminal/transmembrane-proximal region. These alignments are intended for structural interpretation and hypothesis generation only.

| ROI | ANDV range | Length | Mean identity (%) | Mean entropy | Rationale |
|:--|--:|--:|--:|--:|:--|
| High-conservation Gn window 2 | 379-409 | 31 | 88.71 | 0.068 | Automatically selected 31-aa Gn window with high mean column identity (88.7%). |
| High-conservation Gn window 1 | 435-465 | 31 | 93.28 | 0.058 | Automatically selected 31-aa Gn window with high mean column identity (93.3%). |
| WAASA cleavage / Gn-Gc junction | 621-681 | 61 | 76.09 | 0.178 | Motif-centered region around the conserved WAASA-like Gn/Gc cleavage junction. |
| N-terminal Gc segment after WAASA | 652-720 | 69 | 71.98 | 0.213 | Immediate post-cleavage Gc segment; useful for comparing conservation at the beginning of estimated Gc. |
| High-conservation Gc window 2 | 758-788 | 31 | 89.25 | 0.08 | Automatically selected 31-aa Gc window with high mean column identity (89.2%). |
| High-conservation Gc window 1 | 983-1013 | 31 | 89.52 | 0.08 | Automatically selected 31-aa Gc window with high mean column identity (89.5%). |
| C-terminal transmembrane-proximal segment | 1060-1138 | 79 | 74.1 | 0.19 | C-terminal hydrophobic/transmembrane-proximal region of ANDV GPC; alignment is useful for structural-context discussion. |

### High-conservation Gn window 2

ANDV reference range: `379-409`. Automatically selected 31-aa Gn window with high mean column identity (88.7%).

![High-conservation Gn window 2](figures/regional_alignments/roi_gn_conserved_2.png)

```text
ANDV   CTVFCTLAGPGASCEAYSENGIFNISSPTCL
SNV    CTVFCTLAGPGASCEAYSETGIFNISSPTCL
BAYV   CNVFCTLAGPGASCEAYSENGIFNISSPTCL
BCCV   CNVFCTLAGPGASCEAYSENGIFNISSPTCL
PUUV   CTVFCTLAGPGADCEAYSETGIFNISSPTCL
TULV   CTVFCTLSGPGADCEAYSDTGIFNISSPTCL
PHV    CTIFCTLAGPGADCEAYSDTGIFNISSPTCL
HTNV   CTVFCVLSGPGASCEAFSEGGIFNITSPMCL
AMRV   CTVFCVLSGPGASCEAFSEGGIFNITSPMCL
SEOV   CNVFCVLSGPGASCEAFSEGGIFNITSPMCL
DOBV   CNVFCVLSGPGASCEAFSEGGIFNITSPTCL
THAIV  CNVFCVLSGPGASCEAFSEGGIFNITSPTCL
CONS   CtvFCtLsGPGAsCEAySegGIFNIsSPtCL
```

### High-conservation Gn window 1

ANDV reference range: `435-465`. Automatically selected 31-aa Gn window with high mean column identity (93.3%).

![High-conservation Gn window 1](figures/regional_alignments/roi_gn_conserved_1.png)

```text
ANDV   VVYCNGQKKVILTKTLVIGQCIYTFTSLFSL
SNV    VVYCNGQKKVILTKTLVIGQCIYTFTSLFSL
BAYV   VVYCNGQKKVILTKTLVIGQCIYTFTSLFSL
BCCV   IVYCNGQKKVILTKTLVIGQCIYTFTSIFSL
PUUV   TVYCNGVKKVILTKTLVIGQCIYTFTSIFSL
TULV   TVYCNGVKKVILTKTLVIGQCIYTFTSIFSL
PHV    VVYCNGMKKVILTKTLVIGQCIYTFTSVFSL
HTNV   VVYCNGQRKVILTKTLVIGQCIYTITSLFSL
AMRV   VVYCNGQKKVILTKTLVIGQCIYTITSLFSL
SEOV   IVYCNGHKKTILTKTLVIGQCIYTITSLFSL
DOBV   VIYCNGQKKTILTKTLVIGQCIYSVTSLFSI
THAIV  IVYCNGQKKTILTKTLVIGQCIYTITSLFSL
CONS   vvYCNGqkKvILTKTLVIGQCIYtfTSlFSl
```

### WAASA cleavage / Gn-Gc junction

ANDV reference range: `621-681`. Motif-centered region around the conserved WAASA-like Gn/Gc cleavage junction.

![WAASA cleavage / Gn-Gc junction](figures/regional_alignments/roi1_waasa_cleavage.png)

```text
ANDV   LGVFRYKSRCYVGLVWCLLLTCEIVIWAASAETPLMESGWSDTAHGVGEIPMKTDLELDFS
SNV    LGVFRYKSRCYVGLVWGILLTTELIIWAASADTPLMESGWSDTAHGVGIIPMKTDLELDFA
BAYV   LGVFRYKSRCYVGLVWSFLLTLELIVWAASADTPLVEVGWSDTAHGVGDIPMKTDLELDFA
BCCV   LGVFRYKSRCYVGLVWMCLLTLELIVWAASADTPLLEPGWSDTAHGVGDIPMKTDLELDFA
PUUV   LSLFRYRSRFFVGLVWCVLLVLELIVWAASAETQNLNSGWTDTAHGSGIIPMKTDLELDFS
TULV   LSMFRYKSKCYVGLVWCILLTTELVIWAASAETMNLEPGWTDTAHGSGIIPLKTDLELDFS
PHV    LSVFRYRSRCFVGLVWCILLVLELVIWAASADTVEIKTGWTDTAHGAGVIPLKSDLELDFS
HTNV   LNLFRYKSRCYIFTMWVFLLILESVLWAASASETPLAPVWNDNAHGVGSVPMHTDLELDFS
AMRV   LNLFRYKSRCYIFTMWVFLLILESILWAASASETPLTPIWNDNAHGVGSIPMHTDLELDFS
SEOV   LNLFRYKSRCYILRMWTLLLIIESILWAASATEIPLVPLWTDNTHGVGSVPMHTDLELDFS
DOBV   LNLFRYKSRCYIFTVWVTLLIIESIMWAASASETVLEPSWNDNAHGVGVVPMHTDLELDFS
THAIV  LNLFRYKSRCYILTMWLFLLIVESVMWAASAVEIPLVPLWTDNAHGIGSVPMHTDLELDFS
CONS   LnlFRYkSrcyvglvWcfLLtlEliiWAASAdtpplepgWtDtaHGvGsiPmktDLELDFs
```

### N-terminal Gc segment after WAASA

ANDV reference range: `652-720`. Immediate post-cleavage Gc segment; useful for comparing conservation at the beginning of estimated Gc.

![N-terminal Gc segment after WAASA](figures/regional_alignments/roi2_gc_nterm.png)

```text
ANDV   ETPLMESGWSDTAHGVGEIPMKTDLELDFSLPSSSSYSYRRKLTNPANKEESIPFHFQMEKQVIHAEIQ
SNV    DTPLMESGWSDTAHGVGIIPMKTDLELDFALASSSSYSYRRKLVNPANQEETLPFHFQLDKQVVHAEIQ
BAYV   DTPLVEVGWSDTAHGVGDIPMKTDLELDFAIASSSSYSYRRKLTNPANPEESVPFHFQLERQVIHAEIQ
BCCV   DTPLLEPGWSDTAHGVGDIPMKTDLELDFAIPSSSSYSYRRRLVNPANSDETVPFHFQLERQVIHAEIQ
PUUV   ETQNLNSGWTDTAHGSGIIPMKTDLELDFSLPSSASYTYRRQLQNPANEQENIPFHLQISKQVIHAEIQ
TULV   ETMNLEPGWTDTAHGSGIIPLKTDLELDFSLPSSATYTYRRELQNPANEQEKIPFHFQMERQVIHAEIQ
PHV    DTVEIKTGWTDTAHGAGVIPLKSDLELDFSLPSSATYIYRRDLQNPANEQERIPFHFQLQRQVIHAEIQ
HTNV   SETPLAPVWNDNAHGVGSVPMHTDLELDFSLTSSSKYTYRRKLTNPLEEAQSIDLHIEIEEQTIGVDVH
AMRV   SETPLTPIWNDNAHGVGSIPMHTDLELDFSLTSSSKYTYRRKLTNPLEETQAVDLHIELAEQTIGVDVH
SEOV   TEIPLVPLWTDNTHGVGSVPMHTDLELDFSLPSSSKYTYKRHLTNPVNDQQSVSLHIEIESQGIGADVH
DOBV   SETVLEPSWNDNAHGVGVVPMHTDLELDFSLPSSSKYTYKRKLTSPLNQEQSVDLHIEIESQGISTSVH
THAIV  VEIPLVPLWTDNAHGIGSVPMHTDLELDFSLPSSSKYTYKRKLTNPINVEQGVQVHIEIEEQGIGADVH
CONS   dtpplepgWtDtaHGvGsiPmktDLELDFslpSSssYtYrRkLtnPaneeesvpfHfqlerQvihaeiq
```

### High-conservation Gc window 2

ANDV reference range: `758-788`. Automatically selected 31-aa Gc window with high mean column identity (89.2%).

![High-conservation Gc window 2](figures/regional_alignments/roi_gc_conserved_2.png)

```text
ANDV   KDYQYETGWGCNPGDCPGVGTGCTACGVYLD
SNV    KDYQYETSWGCNPPDCPGVGTGCTACGVYLD
BAYV   KDYQYETSWACNPPDCPGVGTGCTACGIYLD
BCCV   KDYQYETSWSCNPPDCPGVGTGCTACGIYLD
PUUV   KDYEYETGWGCNPPDCPGVGTGCTACGAYLD
TULV   KDFEYETGWGCNPPDCPGVGTGCTACGVYLD
PHV    KDYEFETGWGCNPGDCPGVGTGCTACGVYLD
HTNV   RDYQYETSWGCNPSDCPGVGTGCTACGLYLD
AMRV   RDYQYETSWGCNPADCPGVGTGCTACGLYLD
SEOV   KDYEYENSWACNPPDCPGIGTGCTACGLYLD
DOBV   RDFEYENNWGCNPADCPGIGTGCTACGLYID
THAIV  KDYEYENSWACNPADCPGVGTGCTACGLYLD
CONS   kDyqyEtsWgCNPpDCPGvGTGCTACGlYlD
```

### High-conservation Gc window 1

ANDV reference range: `983-1013`. Automatically selected 31-aa Gc window with high mean column identity (89.5%).

![High-conservation Gc window 1](figures/regional_alignments/roi_gc_conserved_1.png)

```text
ANDV   GAWGSGVGFTLTCTVGLTECPSFMTSIKACD
SNV    GAWGSGVGFTLVCTVGLTECANFITSIKACD
BAYV   GAWGSGVGFTLTCVVGLTECPNFITSIKACD
BCCV   GAWGSGVGFTLTCIVGLTECSSFMTSIKVCD
PUUV   GAWGSGVGFNLVCTVSLTECSAFLTSIKACD
TULV   GAWGSGVGFNLVCSVSLTECATFLTSIKACD
PHV    GAWGSGVGFNLVCSVSLTECASFLTSIKACD
HTNV   GAWGSGVGFTLTCLVSLTECPTFLTSIKACD
AMRV   GAWGSGVGFTLTCQVSLTECPAFLTSIKACD
SEOV   GAWGSGVGFTLTCQVSLTECPTFLTSIKACD
DOBV   GAWGSGVGFTLTCQISLTECSRFLTSIKACD
THAIV  GAWGSGVGFTLTCQVSLTECPTFLTSIKACD
CONS   GAWGSGVGFtLtCqvsLTECptFlTSIKaCD
```

### C-terminal transmembrane-proximal segment

ANDV reference range: `1060-1138`. C-terminal hydrophobic/transmembrane-proximal region of ANDV GPC; alignment is useful for structural-context discussion.

![C-terminal transmembrane-proximal segment](figures/regional_alignments/roi3_cterm_tm_proximal.png)

```text
ANDV   ASAPHLERVTGFNQIDSDKVYDDGAPPCTFKCWFTKSGEWLLGILNGNWIVVVVLVVILILSIIMFSVLCPRRGHKKTV
SNV    ASPPHLDRVTGYNQIDSDKVYDDGAPPCTIKCWFTKSGEWLLGILNGNWVVVAVLIVILILSILLFSFFCPVRSRKNKA
BAYV   ASAPHLERVTGFNQVDSDKVYDDGAPPCSIKCWFSKSGEWLLGILSGNWVVVAVLVVILLISIVLFSFLCPIRSHKKQL
BCCV   ASAPHLERVTGFNQIDSDKVYDDGAPPCSIKCWFAKSGEWLLGILNGNWVVVAVLVIILLISIFLFSFFCPIRSHKKQL
PUUV   AAAPHLDRVTGYNQADSDKIFDDGAPECGMSCWFKKSGEWILGVLNGNWMVVAVLIALLVLSILLFTLCCPRRPSYRKE
TULV   AAAPHLDRVTGYNQIDTNKVFDDGAPQCGVHCWFKKSGEWLLGILSGNWMVVAVLIALFIFSLLLFSLCCPRRQNYKKN
PHV    AAAPHLDRVTGYNVIDNDKVFDDGSPECGVHCWFKKSGEWLMGILSGNWMVVAVLVVLLILSIFLFSLCCPRRVVHKKS
HTNV   AAAPHLDKVNGISEIENSKVYDDGAPQCGIKCWFVKSGEWISGIFSGNWIVLIVLCVFLLFSLVLLSILCPVRKHKKS-
AMRV   AAAPHLDKVNGISEMENSKVYDDGAPECGIKCWFVKSGEWISGIFNGNWIVLIVLCAFLIFSLVLLSLLCPVRKHKKA-
SEOV   ASAPHLDKVNGISDLENEKVYDDGAPECGITCWFKKSGEWVMGIINGNWVVLIVLCVLLLFSLILLSILCPVRKHKKS-
DOBV   ASAPHLDKVNGIVEQESEKVYDDGAPQCGISCWFVKSGEWITGIFNGNWIVIVVLVFFFILSLILLSLLCPIRKHKRS-
THAIV  ATAPHLDRVAGVSELSNEKVYDDGAPQCGITCRFVKSGEWVKGIFNGNWIVLIVLCVLLLISLILLSIFCPVRKHKKS-
CONS   AsaPHLdrVtGynqidsdKvyDDGaPqCgikCwFvKSGEWllGilnGNWiVvaVLvvllilSlilfsllCPvRkhkksl
```

Regional alignment FASTA and CSV files are provided in the report directory using the `roi_*` file prefix.


## Paroxetine-associated pocket: docking/MD interaction context

The predicted paroxetine-binding pocket is located within the surface-exposed Andes orthohantavirus glycoprotein complex, a structural assembly involved in viral attachment and entry. In the docking model and MD-derived contact profile, the pocket includes recurrent contacts near residues such as ARG199, ALA310, PRO311, SER332, and GLN335, with additional contacts involving residues such as SER142, SER217, ASP312, PHE360, TYR364, ARG367, and VAL219. These residues have not been experimentally validated as receptor-binding determinants or antiviral targets; therefore, their functional interpretation must remain cautious. Mapping this region onto the Gn/Gc conservation analysis places the pocket within the estimated Gn-associated region, upstream of the conserved WAASA-like Gn/Gc junction. Because hantavirus membrane fusion is primarily mediated by the Gc class II fusion machinery, the paroxetine-associated pocket should not be interpreted as a canonical fusion-loop target. It is more appropriately described as a putative attachment- or entry-modulatory surface pocket within the glycoprotein spike architecture. The MD contact persistence supports pose-level stability of the computational model, but it does not establish binding affinity, entry inhibition, antiviral activity, or therapeutic relevance.

**Interpretation boundary:** this section links the molecular-dynamics contact profile with the Gn/Gc conservation map only as a computational hypothesis-generating analysis. It does not constitute experimental validation or a claim of antiviral efficacy.

![Paroxetine protein-ligand contact profile](figures/paroxetine_md/protein_ligand_interaction_publication.png)

**Figure. Paroxetine protein-ligand contact profile during MD follow-up.** Top: total protein-ligand contacts across the simulated trajectory. Middle: residue-resolved contact heatmap. Bottom: interaction class summary for recurrent residues. The most persistent contacts in the summarized table include ALA310, PRO311, SER332, SER142, ARG199, GLN335, SER217, ASP312.

### Most recurrent MD contact residues

| Residue | Dominant interaction | Total contacts | Mean contacts | Frames present | Interaction fraction |
|---|---:|---:|---:|---:|---:|
| ALA310 | Hydrophobic | 918 | 3.53 | 260 | 2.65 |
| PRO311 | Hydrophobic | 646 | 2.50 | 258 | 1.86 |
| SER332 | H-bonds | 481 | 2.20 | 219 | 1.39 |
| SER142 | H-bonds | 480 | 2.94 | 163 | 1.38 |
| ARG199 | Ionic | 406 | 2.01 | 202 | 1.17 |
| GLN335 | H-bonds | 398 | 1.91 | 208 | 1.15 |
| SER217 | H-bonds | 258 | 1.76 | 147 | 0.74 |
| ASP312 | Ionic | 253 | 1.95 | 130 | 0.73 |
| PHE360 | Hydrophobic | 230 | 1.65 | 139 | 0.66 |
| TYR364 | H-bonds | 220 | 1.31 | 168 | 0.63 |
| GLY145 | Hydrophobic | 212 | 2.08 | 102 | 0.61 |
| PHE307 | Hydrophobic | 166 | 1.46 | 114 | 0.48 |


Supplementary files: `figures/paroxetine_md/protein_ligand_interaction_summary.csv` and `figures/paroxetine_md/protein_ligand_contacts_by_residue_timeseries.csv`.

## Results interpretation

The conservation profile highlights residues and windows that remain similar across American and Eurasian orthohantavirus representatives. Regions with high identity and low gap fraction are more suitable for cross-virus structural comparison than highly variable segments. Conversely, variable windows may reflect lineage-specific surface or host-adaptation differences and should not be overinterpreted without structural and experimental context.

## Limitations

- The Gn/Gc split is motif-based and approximate.
- One representative sequence per virus does not capture within-species diversity.
- NCBI records vary in annotation quality; final manuscript use should cite curated accessions and, where possible, UniProt/RefSeq annotations.
- Sequence conservation alone does not establish druggability, neutralization relevance, or functional essentiality.

## Output files

- `selected_gpc_sequences.csv`
- `gpc_sequences.fasta`
- `gpc_alignment_mafft.fasta`
- `conservation_by_alignment_position.csv`
- `andv_referenced_conservation.csv`
- `pairwise_identity_percent.csv`
- `region_conservation_summary.csv`
- `estimated_gn_gc_boundaries.csv`
