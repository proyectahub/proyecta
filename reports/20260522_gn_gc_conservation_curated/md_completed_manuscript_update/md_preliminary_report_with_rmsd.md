# Reporte preliminar de dinámica molecular

Fecha de corte del portal: 2026-05-24T19:04:19.169158+00:00 UTC.

Este reporte resume las trayectorias completadas y el estado actual del portal GROMACS. Las curvas RMSD y radio de giro se calcularon con GROMACS 2025.3 usando el grupo `Protein`. Estas métricas son diagnósticas de estabilidad estructural del modelo simulado; no constituyen evidencia experimental de unión, actividad antiviral ni eficacia terapéutica.

## Estado del portal GROMACS
|display|target|ligand_or_state|role|portal_status|progress|finished_at|md_xtc_gb|
|---|---|---|---|---|---|---|---|
|9P3Y/granisetron|9P3Y|Granisetron|candidate|completed|100.000|2026-05-23T23:20:24+00:00|3.080|
|5E04/ribavirin|5E04|Ribavirin|reference control|completed|100.000|2026-05-24T06:26:07+00:00|8.250|
|5E04/paroxetine repeat|5E04|Paroxetine|candidate repeat|completed|100.000|2026-05-24T13:50:35+00:00|8.090|
|9P3Y/NAG|9P3Y|NAG|structural control|running_md|100.000||7.730|
|5E04 apo|5E04|apo receptor|apo baseline|queued|0.000||0|
|9P3Y apo|9P3Y|apo receptor|apo baseline|queued|0.000||0|

![Estado del portal](I:\MDATOS2.0\reports\20260522_gn_gc_conservation_curated\md_completed_manuscript_update\md_portal_status_snapshot.png)

## Métricas preliminares de trayectorias completadas
|display|target|ligand_or_state|role|trajectory_time_ns|rmsd_mean_nm|rmsd_median_nm|rmsd_final_nm|rmsd_max_nm|rg_mean_nm|rg_final_nm|
|---|---|---|---|---|---|---|---|---|---|---|
|5E04/paroxetine repeat|5E04|Paroxetine|candidate repeat|50.000|0.305|0.309|0.349|0.392|2.054|2.042|
|5E04/ribavirin|5E04|Ribavirin|reference control|50.000|0.259|0.260|0.279|0.329|2.051|2.034|
|9P3Y/granisetron|9P3Y|Granisetron|candidate|50.000|0.432|0.435|0.434|0.608|2.888|2.865|

![Curvas RMSD/Rg](I:\MDATOS2.0\reports\20260522_gn_gc_conservation_curated\md_completed_manuscript_update\md_preliminary_rmsd_rg_composite.png)

## Texto listo para manuscrito

### Seguimiento por dinámica molecular
Las simulaciones de dinámica molecular se utilizaron como una etapa computacional posterior al acoplamiento molecular para evaluar el comportamiento estructural de complejos priorizados y controles de referencia bajo un protocolo atomístico común. Al punto de corte de este reporte, se encontraban completadas tres trayectorias de producción de 50 ns: el complejo 9P3Y/granisetron, el complejo 5E04/ribavirin utilizado como referencia computacional y la repetición 5E04/paroxetine. La simulación 9P3Y/NAG permanecía activa, mientras que las simulaciones apo de 5E04 y 9P3Y estaban en cola como controles estructurales de receptor.

El RMSD de proteína y el radio de giro se calcularon a partir de las trayectorias completadas utilizando el grupo de proteína definido por GROMACS. Estas curvas proporcionan una evaluación preliminar de estabilidad conformacional global y compacidad del receptor durante la producción. La interpretación comparativa definitiva se reserva hasta completar el control estructural 9P3Y/NAG y las trayectorias apo, ya que estas simulaciones permiten distinguir fluctuaciones asociadas al receptor de fluctuaciones dependientes del ligando o del estado de control.

En esta etapa, los resultados de dinámica molecular deben interpretarse como evidencia computacional auxiliar para priorización y control de plausibilidad estructural. No se infieren constantes de afinidad, inhibición viral, actividad antiviral ni relevancia terapéutica a partir de estas simulaciones.

## Archivos generados
- `I:\MDATOS2.0\reports\20260522_gn_gc_conservation_curated\md_completed_manuscript_update\md_preliminary_comparative_metrics.csv`
- `I:\MDATOS2.0\reports\20260522_gn_gc_conservation_curated\md_completed_manuscript_update\md_portal_status_table.csv`
- `I:\MDATOS2.0\reports\20260522_gn_gc_conservation_curated\md_completed_manuscript_update\md_preliminary_rmsd_rg_composite.png`
- `I:\MDATOS2.0\reports\20260522_gn_gc_conservation_curated\md_completed_manuscript_update\md_portal_status_snapshot.png`