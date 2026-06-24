/**
 * Proyectos de prueba para testing del flujo de minería
 */

export const TEST_USER_MONERO_ADDRESS = '42gfB3ayxZV2VNH8KAsUMU5fcXUqd83BGJneR37KqJaBQuzYJ8w5d3aV5DBkFH2oWo9YzJLcjhv2d5dR4V2C2xFrUGKiePh'

export const SAMPLE_TEST_PROJECTS = [
  {
    id: 'proj_test_001',
    title: 'Investigación en Biología Molecular',
    description: 'Estudio de mutaciones genéticas en plantas resistentes a sequía. Este proyecto busca identificar los mecanismos biológicos detrás de la resiliencia en cultivos bajo estrés hídrico.',
    category: 'biology',
    fundingGoal: 10,
    fundraisingAddress: TEST_USER_MONERO_ADDRESS,
    moneroAddress: TEST_USER_MONERO_ADDRESS,
    author: 'test_vita_001',
    authorName: 'Equipo de prueba',
    raised: 0,
    status: 'active',
    hitos: [],
    createdAt: Date.now(),
  },
  {
    id: 'proj_test_002',
    title: 'Análisis de Cambio Climático',
    description: 'Modelado computacional de impacto del cambio climático en ecosistemas de agua dulce. Usando simulaciones de dinámica molecular para estudiar interacciones moleculares.',
    category: 'biology',
    fundingGoal: 15,
    fundraisingAddress: TEST_USER_MONERO_ADDRESS,
    moneroAddress: TEST_USER_MONERO_ADDRESS,
    author: 'test_vita_002',
    authorName: 'Equipo de prueba',
    raised: 0,
    status: 'active',
    hitos: [],
    createdAt: Date.now() - 86400000,
  },
]

/**
 * Normaliza proyectos antiguos que no tienen todos los campos requeridos.
 * Evita crashes en la lista/tarjeta por campos undefined (raised, status, hitos).
 */
function normalizeProject(p: any) {
  return {
    ...p,
    raised: typeof p.raised === 'number' ? p.raised : 0,
    status: p.status || 'active',
    hitos: Array.isArray(p.hitos) ? p.hitos : [],
    category: p.category || 'other',
    fundraisingAddress: p.fundraisingAddress || p.moneroAddress || '',
  }
}

export function seedTestProjects() {
  const existing = JSON.parse(localStorage.getItem('proyecta_projects') || '[]')

  // Normalizar todos los proyectos existentes (migración de datos antiguos)
  let normalized = existing.map(normalizeProject)

  // Solo agregar proyectos de test si no existen
  if (!normalized.some((p: any) => String(p.id).includes('test'))) {
    normalized = [...SAMPLE_TEST_PROJECTS, ...normalized]
  }

  localStorage.setItem('proyecta_projects', JSON.stringify(normalized))
}
