import { generateMoneroAddress } from './moneroAddress'
import { normalizeProjectWallet } from './projectWallet'

/**
 * Proyectos de prueba para testing del flujo de mineria
 */

export const TEST_USER_MONERO_ADDRESS = generateMoneroAddress('proyecta-test-wallet')

export const SAMPLE_TEST_PROJECTS = [
  {
    id: 'proj_test_001',
    title: 'Investigacion en Biologia Molecular',
    description: 'Estudio de mutaciones geneticas en plantas resistentes a sequia. Este proyecto busca identificar los mecanismos biologicos detras de la resiliencia en cultivos bajo estres hidrico.',
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
    title: 'Analisis de Cambio Climatico',
    description: 'Modelado computacional de impacto del cambio climatico en ecosistemas de agua dulce. Usando simulaciones de dinamica molecular para estudiar interacciones moleculares.',
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
  return normalizeProjectWallet({
    ...p,
    raised: typeof p.raised === 'number' ? p.raised : 0,
    status: p.status || 'active',
    hitos: Array.isArray(p.hitos) ? p.hitos : [],
    category: p.category || 'other',
  })
}

export function seedTestProjects() {
  const existing = JSON.parse(localStorage.getItem('proyecta_projects') || '[]')

  // Normalizar todos los proyectos existentes (migracion de datos antiguos)
  let normalized = existing.map(normalizeProject)

  // Solo agregar proyectos de test si no existen
  if (!normalized.some((p: any) => String(p.id).includes('test'))) {
    normalized = [...SAMPLE_TEST_PROJECTS, ...normalized]
  }

  localStorage.setItem('proyecta_projects', JSON.stringify(normalized))
}