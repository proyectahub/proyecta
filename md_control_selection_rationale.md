# MD control selection rationale

Run bundle: `20260513T082956Z_full_70f1959a`

This document records the computational-control rationale for the pilot molecular-dynamics follow-up. These controls are comparison references only. They are not treated as validated positive docking controls, antiviral efficacy controls, clinical comparators, or evidence of activity against Andes orthohantavirus targets.

## Selected receptor-specific MD systems

| Target | Top docked candidate selected for MD | Docking score used for selection | Control selected | Control role |
|---|---|---:|---|---|
| 5E04 Andes virus nucleoprotein | PAROXETINE_chembl490 | -8.73 kcal/mol | RIBAVIRIN_control | Broad-spectrum antiviral computational reference with published Andes/hantavirus literature; not target-specific for 5E04. |
| 9P3Y Andes virus glycoprotein tetramer | GRANISETRON_chembl289469 | -6.523 kcal/mol | NAG_structural_control | Glycan-fragment structural control for the NAG-associated exploratory pocket; not an antiviral compound. |

## Literature and structure rationale

### 5E04 nucleoprotein control

Ribavirin was selected as the 5E04 computational comparison control because it has direct Andes virus / hantavirus antiviral literature support, whereas the present docking site is a structural hypothesis around the nucleoprotein RNA-binding crevice. The control is therefore appropriate as a broad antiviral reference molecule for computational comparison, but not as a validated binder of the 5E04 pocket.

Supporting sources:

- RCSB describes 5E04 as the crystal structure of Andes virus nucleoprotein and notes the functional relevance of positively charged residues in the RNA-binding crevice.
- PubMed PMID 21853152 reports in vitro and in vivo ribavirin activity against Andes virus infection.
- PubMed PMID 24217424 reports ribavirin protection in a Syrian hamster model after Andes virus exposure.
- PubMed PMID 23300158 reports ribavirin effects on Andes-virus-induced cytokine responses, while also noting therapeutic limitations.

Favipiravir was considered as an alternative broad antiviral reference because literature reports anti-hantavirus activity and activity against ANDV/SNV models, but ribavirin was selected for the first MD control because the ANDV-specific ribavirin literature is more direct for this project bundle.

### 9P3Y glycoprotein control

N-acetyl-D-glucosamine (NAG) was selected for 9P3Y because the RCSB 9P3Y entry identifies NAG ligand interaction/annotation in the Andes virus glycoprotein tetramer structure. The 9P3Y pocket used in this project was explicitly treated as a NAG/glycan-associated exploratory ligandable region. NAG is therefore a structural/glycan-fragment control, not an antiviral control.

Supporting source:

- RCSB describes 9P3Y as an Andes virus glycoprotein tetramer in complex with ADI-65534 Fab and lists ligand interaction annotation for NAG.

## MD launch notes

The generated control poses were obtained computationally using AutoDock Vina in the same receptor/site boxes used for the approved-drug repurposing screen:

| Control | Target | Vina score used for initial pose |
|---|---|---:|
| RIBAVIRIN_control | 5E04 | -6.181 kcal/mol |
| NAG_structural_control | 9P3Y | -5.04 kcal/mol |

These scores are used only to define initial poses for pilot MD and should not be interpreted as experimental affinity or biological activity.

## Source URLs

- RCSB 5E04: https://www.rcsb.org/structure/5E04
- RCSB 9P3Y: https://www.rcsb.org/structure/9P3Y
- Ribavirin ANDV PubMed PMID 21853152: https://pubmed.ncbi.nlm.nih.gov/21853152/
- Ribavirin ANDV PubMed PMID 24217424: https://pubmed.ncbi.nlm.nih.gov/24217424/
- Ribavirin cytokine-response PubMed PMID 23300158: https://pubmed.ncbi.nlm.nih.gov/23300158/
- Favipiravir hantavirus PubMed PMID 21566265: https://pubmed.ncbi.nlm.nih.gov/21566265/
