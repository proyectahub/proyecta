# 📊 REPORTE DW — DOCKING PROTEÍNA L (SARAMPIÓN)

**Generado:** 2026-06-14  
**Receptor:** 9OCF - Proteína L (Measles virus)  
**Total ligandos:** 1101

---

## 📈 RESUMEN EJECUTIVO

### Afinidades (kcal/mol)
| Métrica | Valor |
|---------|-------|
| **Mejor** | -10.934 |
| **Peor** | 1.889 |
| **Promedio** | -7.434 |
| **Mediana** | -7.657 |
| **Desv. Est.** | 1.407 |

### Percentiles
| P10 | P25 | P50 | P75 | P90 |
|-----|-----|-----|-----|-----|
| -9.020 | -8.433 | -7.657 | -6.670 | -5.522 |

---

## 🏆 CATEGORIZACIÓN POR AFINIDAD

| Categoría | Rango | Cantidad | % |
|-----------|-------|----------|---|
| **Excelente** | < -8.0 | 409 | 37.1% |
| **Buena** | -8.0 a -7.0 | 343 | 31.2% |
| **Moderada** | -7.0 a -6.0 | 181 | 16.4% |
| **Débil** | -6.0 a -5.0 | 95 | 8.6% |
| **Muy débil** | ≥ -5.0 | 73 | 6.6% |

---

## 🥇 TOP 10 LIGANDOS CON MEJOR AFINIDAD

1. **DOLUTEGRAVIR** — -10.934 kcal/mol
2. **CABOTEGRAVIR_SODIUM** — -10.925 kcal/mol
3. **DOLUTEGRAVIR_SODIUM** — -10.836 kcal/mol
4. **ESTRADIOL_BENZOATE** — -10.631 kcal/mol
5. **BICTEGRAVIR** — -10.435 kcal/mol
6. **OLAPARIB** — -10.241 kcal/mol
7. **QUINESTRADOL** — -10.176 kcal/mol
8. **ZIPRASIDONE_HYDROCHLORIDE** — -10.142 kcal/mol
9. **LUMATEPERONE** — -10.092 kcal/mol
10. **DANICOPAN** — -10.050 kcal/mol

---

## 📁 ARCHIVOS GENERADOS

### 1. **L_docking_report.csv** (198 KB)
Formato tabular con todos los datos extraídos:
- ligand_id
- ligand_name
- affinity_kcal_mol
- inter_energy
- intra_energy
- receptor
- protein_source
- methodology
- grid_center (x, y, z)
- grid_size (x, y, z)
- extraction_date
- pdbqt_file

**Uso:** Importar en Excel, SQL, Python/Pandas, herramientas BI (Tableau, Power BI, etc.)

### 2. **L_docking_report.xlsx** (96 KB)
Libro Excel con 4 hojas:
- **All Ligands** — Todos los 1101 ligandos
- **Top 50** — Los 50 mejores por afinidad
- **Statistics** — Resumen estadístico
- **Categories** — Distribución por categoría

**Uso:** Análisis interactivo, gráficos, filtros en Excel

### 3. **L_docking_report.sql** (271 KB)
Script SQL con:
- Definición de tabla: `docking_results_L`
- 1101 INSERT statements (valores actuales)

**Uso:** Cargar directamente en SQL Server, PostgreSQL, MySQL, etc.

```sql
-- Crear tabla
CREATE TABLE docking_results_L (
    ligand_id INT PRIMARY KEY,
    ligand_name VARCHAR(255) NOT NULL,
    affinity_kcal_mol FLOAT NOT NULL,
    inter_energy FLOAT,
    intra_energy FLOAT,
    receptor VARCHAR(100),
    protein_source VARCHAR(100),
    methodology VARCHAR(255),
    grid_center_x FLOAT,
    grid_center_y FLOAT,
    grid_center_z FLOAT,
    grid_size_x FLOAT,
    grid_size_y FLOAT,
    grid_size_z FLOAT,
    extraction_date TIMESTAMP,
    pdbqt_file VARCHAR(255)
);

-- Cargar 1101 registros
INSERT INTO docking_results_L VALUES (...);
```

---

## 🔧 PARÁMETROS METODOLÓGICOS

| Parámetro | Valor |
|-----------|-------|
| **Receptor** | 9OCF_L_chain_receptor_rigid.pdbqt |
| **Metodología** | AutoDock Vina (RDKit repositioned) |
| **Grid center** | (171.19, 168.1, 191.55) |
| **Grid size** | (21.099, 13.6, 24.173) |
| **Exhaustiveness** | 8 |
| **Num modes** | 9 |
| **Energy range** | 3 kcal/mol |
| **Seed** | 42 |

---

## 📊 CASOS DE USO

### Para Data Warehouse
```sql
-- Cargar en DW
INSERT INTO dw.docking_analysis
SELECT * FROM docking_results_L;

-- Queries de análisis
SELECT ligand_name, affinity_kcal_mol 
FROM docking_results_L 
WHERE affinity_kcal_mol < -8.0
ORDER BY affinity_kcal_mol;
```

### Para Python/Pandas
```python
import pandas as pd

df = pd.read_csv('L_docking_report.csv')

# Top 10
print(df.nsmallest(10, 'affinity_kcal_mol'))

# Filtrar por categoría
excellent = df[df['affinity_kcal_mol'] < -8.0]
print(f"Ligandos excelentes: {len(excellent)}")
```

### Para Visualización (Matplotlib, Seaborn)
```python
import matplotlib.pyplot as plt
import seaborn as sns

# Histograma de afinidades
plt.figure(figsize=(10, 6))
plt.hist(df['affinity_kcal_mol'], bins=50, edgecolor='black', alpha=0.7)
plt.xlabel('Affinity (kcal/mol)')
plt.ylabel('Frequency')
plt.title('Distribution of Binding Affinities (Protein L vs Ligands)')
plt.grid(alpha=0.3)
plt.savefig('affinity_distribution.png', dpi=300, bbox_inches='tight')
```

---

## ⚙️ PRÓXIMOS PASOS

1. **Validación experimental** — Seleccionar top 10-20 ligandos para síntesis/pruebas
2. **Análisis molecular** — Extraer geometría de contactos (MMGBSA, PLIP, LigPlot+)
3. **ADME/Tox** — Evaluación de propiedades farmacocinéticas (RDKit, SwissADME)
4. **Comparación F/L** — Repetir pipeline para proteína F y comparar resultados
5. **Machine Learning** — Entrenar modelos predictivos si hay datos experimentales

---

## 📝 NOTAS TÉCNICAS

- **Afinidades negativas** = unión favorable (más negativo = mejor unión)
- **Rango típico** = -5 a -10 kcal/mol para ligandos bioactivos
- **68% de ligandos** tienen afinidad < -7.0 (buena/excelente)
- **Metodología reproducible** — seed=42 garantiza resultados consistentes

---

**Generado automáticamente por:** `extract_docking_report.py`  
**Fecha:** 2026-06-14 19:18:41
