# Trajectory Contact Map

Generador local de figura tipo paper con tres paneles:

1. Serie temporal de contactos proteína-ligando.
2. Heatmap contacto-residuo en el tiempo.
3. Perfil de interacción por residuo.

## Archivos de entrada

Puedes usar `.csv`, `.tsv`, `.txt` o `.xvg`.

### 1) `--contacts`
Tabla con al menos dos columnas:

- `time`, `contacts`

o cualquier tabla de dos columnas donde:

- columna 1 = tiempo en ns
- columna 2 = número de contactos

### 2) `--heatmap`
Matriz de contacto-residuo.

Formatos aceptados:

- matriz directa: filas = residuos, columnas = tiempo
- formato largo con columnas:
  - `time`
  - `residue`
  - `value`

### 3) `--profile`
Tabla de perfil de interacción por residuo.

Columnas esperadas:

- `residue`
- `interaction_fraction`
- `interaction_type`

Si las columnas cambian, el script intenta inferirlas.

## Ejemplo

```powershell
python I:\MDATOS2.0\trajectory_contact_map_project\make_trajectory_contact_map.py `
  --contacts I:\data\contacts.csv `
  --heatmap I:\data\heatmap.csv `
  --profile I:\data\profile.csv `
  --system-label "20260519-000913-paroxetine" `
  --out I:\data\trajectory_contact_map.png
```

## Estilo

La figura replica el patrón:

- título grande
- panel superior: contactos vs tiempo
- panel central: heatmap
- panel inferior: barras por residuo

El script también genera leyenda por clase de interacción:

- H-bonds
- Hydrophobic
- Ionic
- Water bridges
- Pi-stacking
- Pi-cation

