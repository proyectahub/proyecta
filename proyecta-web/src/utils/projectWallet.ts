import { generateMoneroAddress, isValidMoneroAddress } from './moneroAddress'

export interface ProjectWalletLike {
  id?: string
  title?: string
  createdAt?: number
  fundraisingAddress?: string
  moneroAddress?: string
  [key: string]: any
}

function deriveSeed(project: ProjectWalletLike) {
  return [
    project.id || 'project',
    project.title || 'unknown',
    project.createdAt || 0,
    project.fundraisingAddress || '',
    project.moneroAddress || '',
  ].join('|')
}

export function normalizeProjectWallet<T extends ProjectWalletLike>(project: T): T {
  const validWallet =
    (project.moneroAddress && isValidMoneroAddress(project.moneroAddress) && project.moneroAddress) ||
    (project.fundraisingAddress && isValidMoneroAddress(project.fundraisingAddress) && project.fundraisingAddress) ||
    generateMoneroAddress(deriveSeed(project))

  return {
    ...project,
    moneroAddress: validWallet,
    fundraisingAddress:
      project.fundraisingAddress && isValidMoneroAddress(project.fundraisingAddress)
        ? project.fundraisingAddress
        : validWallet,
  }
}

export function normalizeProjects<T extends ProjectWalletLike>(projects: T[]): T[] {
  return projects.map((project) => normalizeProjectWallet(project))
}
