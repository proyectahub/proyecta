# Cómo Entrar al Monitor de Docking (SSH)

## Opción 1: Ejecutar el Monitor en Vivo (RECOMENDADO)

### Via PowerShell / CMD (Windows)

```powershell
ssh root@100.65.208.11

# Una vez conectado, ir al directorio del docking:
cd /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg

# Ejecutar el monitor (actualiza cada 5 segundos):
./monitor.sh
```

**O directamente en una sola línea:**

```powershell
ssh root@100.65.208.11 'cd /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg && python3 monitor_progress.py --interval 5.0 --stall-minutes 15.0'
```

---

## Opción 2: Ver Estado Rápido (sin monitor interactivo)

```bash
ssh root@100.65.208.11 "
cd /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg
echo '=== PROGRESS ===';
echo 'Completed poses:';
ls poses/ | wc -l;
echo 'Total ligands:';
ls ligands_pdbqt/ | wc -l;
echo '';
echo '=== CURRENT PROCESS ===';
ps aux | grep vina | grep -v grep;
echo '';
echo '=== LAST COMPLETED ===';
ls -lt poses/ | head -3;
"
```

---

## Opción 3: Ver Logs en Vivo

```bash
# Ver qué ligando está siendo docked AHORA:
ssh root@100.65.208.11 "
ps aux | grep vina | grep -v grep | awk '{print \$NF}' | grep ligand | head -1
"

# Ver el log del ligando actual (en tiempo real):
ssh root@100.65.208.11 "
ligand=\$(ps aux | grep vina | grep -v grep | awk '{print \$NF}' | grep -o '[^/]*\.pdbqt' | head -1 | sed 's/_ligand.*//' | sed 's/ligands_pdbqt\///');
if [ ! -z \"\$ligand\" ]; then
  echo \"Monitoreando: \$ligand\";
  tail -f /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg/logs/\${ligand}.log;
fi
"
```

---

## Opción 4: Monitor Detallado con Python

```bash
# Ejecutar el monitor_progress.py con opciones personalizadas:
ssh root@100.65.208.11 "
cd /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg
python3 monitor_progress.py --interval 2.0 --stall-minutes 10.0
"
```

**Opciones disponibles:**
- `--interval SECONDS`: Actualizar cada X segundos (default: 5.0)
- `--stall-minutes MINUTES`: Alertar si no hay cambios en X minutos (default: 15.0)

---

## Opción 5: Monitoreo desde PowerShell (Loop Automático)

Si prefieres una sesión local que chequee automáticamente cada minuto:

```powershell
# Crear un script PowerShell local:
# Guarda esto como: monitor_docking.ps1

$server = "100.65.208.11"
$user = "root"
$rundir = "/root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg"

while ($true) {
    cls
    Write-Host "=== DOCKING MONITOR ===" -ForegroundColor Cyan
    Write-Host "Updated: $(Get-Date)" -ForegroundColor Yellow
    Write-Host ""
    
    $status = ssh $user@$server "
    cd $rundir
    completed=\$(ls poses/ | wc -l)
    total=\$(ls ligands_pdbqt/ | wc -l)
    percent=\$((completed * 100 / total))
    echo \"Progress: \$completed / \$total (\$percent%)\"
    echo \"Last modified pose:\"
    ls -lt poses/ | head -1 | awk '{print \$NF, \$6, \$7, \$8}'
    "
    
    Write-Host $status -ForegroundColor Green
    Write-Host ""
    Write-Host "Refreshing in 60 seconds... (Ctrl+C to exit)" -ForegroundColor DarkGray
    Start-Sleep -Seconds 60
}

# Ejecutar con:
# .\monitor_docking.ps1
```

---

## Opción 6: Pausar/Reanudar el Docking

Si necesitas pausar el proceso:

```bash
# Pausar:
ssh root@100.65.208.11 "/root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg/pause_run.sh"

# Reanudar:
ssh root@100.65.208.11 "/root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg/resume_run.sh"
```

---

## Opción 7: Ver Resultados en Tiempo Real

```bash
# Actualizar el CSV de resultados y ver los top 5 en vivo:
ssh root@100.65.208.11 "
cd /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg
echo 'TOP 5 HITS (Actualizado ahora):';
head -1 lp_fullscreen_vina_results.csv;
tail -n +2 lp_fullscreen_vina_results.csv | sort -t',' -k5 -n | head -5
"
```

---

## Comandos Útiles Rápidos

```bash
# Chequeo rápido de progreso (30 caracteres):
ssh root@100.65.208.11 "cd /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg && echo \"$(ls poses/ | wc -l)/$(ls ligands_pdbqt/ | wc -l) completed\""

# Ver tiempo estimado:
ssh root@100.65.208.11 "
cd /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg
completed=\$(ls poses/ | wc -l)
total=\$(ls ligands_pdbqt/ | wc -l)
remaining=\$((total - completed))
per_ligand=\$(($(date +%s) - $(stat -c %Y lp_fullscreen_input.csv))) / completed))
eta_sec=\$((remaining * per_ligand))
echo \"ETA: \$((eta_sec / 60)) minutos\"
"

# Ver CPU/memoria del proceso vina:
ssh root@100.65.208.11 "ps aux | grep vina | grep -v grep | awk '{print \"CPU: \" \$3 \"%, MEM: \" \$4 \"%\"}'"
```

---

## Credenciales de Acceso

```
Host: 100.65.208.11
User: root
Method: SSH key (configurado previamente)
Directory: /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg
```

Si no tienes SSH configurado, contacta al administrador del servidor.

---

## Troubleshooting

### "Permission denied"
```bash
ssh root@100.65.208.11
# Verificar permisos:
ls -la /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg/monitor.sh
# Debería ser: -rwxr-xr-x
```

### Monitor congela/no actualiza
```bash
# Salir (Ctrl+C) y reiniciar:
ssh root@100.65.208.11 'killall python3; cd /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg && ./monitor.sh'
```

### Vina dejó de correr
```bash
ssh root@100.65.208.11 'ps aux | grep vina | grep -v grep'
# Si está vacío, el docking terminó
ssh root@100.65.208.11 'cd /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg && wc -l lp_fullscreen_vina_results.csv'
```

---

## Siguiente Paso

Una vez que el docking **complete (198/198)**, ejecutar:

```bash
ssh root@100.65.208.11 "cat /root/mev_lp_vs_runs/20260608T170601Z_mev_lp_fullscreen_bg/lp_fullscreen_vina_results.csv" > final_results.csv
```

Para descargar los resultados finales localmente.
