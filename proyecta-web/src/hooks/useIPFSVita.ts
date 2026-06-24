import { useState } from 'react'

export interface VitaRecord {
  type: 'donation' | 'validation' | 'published' | 'conversion' | 'pledge'
  user: string // Hash SHA-256 del wallet
  amount: number // VITA amount
  txHash?: string // Monero TX hash (para donaciones)
  projectId?: string
  description?: string
  timestamp: number
  ipfsHash: string
}

export interface UserVitaBalance {
  vitaBacked: number // Convertido de XMR
  vitaEarned: number // Por contribuciones
  vitaPledged: number // Apoyando proyectos
  total: number
}

export function useIPFSVita() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simular almacenamiento en IPFS (en producción usar Pinata/NFT.storage)
  const recordVita = async (
    record: Omit<VitaRecord, 'timestamp' | 'ipfsHash'>
  ): Promise<VitaRecord | null> => {
    setLoading(true)
    try {
      const fullRecord: VitaRecord = {
        ...record,
        timestamp: Date.now(),
        ipfsHash: `Qm${Math.random().toString(36).substr(2, 9)}`, // Simulado
      }

      // En producción: guardar en IPFS
      // const formData = new FormData()
      // formData.append('file', new Blob([JSON.stringify(fullRecord)]))
      // const response = await fetch('https://api.nft.storage/upload', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${process.env.IPFS_KEY}` },
      //   body: formData
      // })

      // Guardar localmente por ahora
      const existingRecords = JSON.parse(
        localStorage.getItem('proyecta_vita_records') || '[]'
      )
      existingRecords.push(fullRecord)
      localStorage.setItem('proyecta_vita_records', JSON.stringify(existingRecords))

      setError(null)
      return fullRecord
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error saving to IPFS'
      setError(errorMsg)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Cargar VITA de usuario desde IPFS/localStorage
  const loadUserVita = async (userVitaAddress: string): Promise<UserVitaBalance> => {
    try {
      const records = JSON.parse(
        localStorage.getItem('proyecta_vita_records') || '[]'
      ) as VitaRecord[]

      const userRecords = records.filter((r) => r.user === userVitaAddress)

      let vitaBacked = 0
      let vitaEarned = 0
      let vitaPledged = 0

      for (const record of userRecords) {
        if (record.type === 'donation') {
          vitaBacked += record.amount
        } else if (record.type === 'validation' || record.type === 'published') {
          vitaEarned += record.amount
        } else if (record.type === 'pledge') {
          vitaPledged += record.amount
        } else if (record.type === 'conversion') {
          vitaBacked -= record.amount // Restar si convierte
        }
      }

      return {
        vitaBacked: Math.max(0, vitaBacked),
        vitaEarned: Math.max(0, vitaEarned),
        vitaPledged: Math.max(0, vitaPledged),
        total:
          Math.max(0, vitaBacked) +
          Math.max(0, vitaEarned) -
          Math.max(0, vitaPledged),
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading VITA')
      return {
        vitaBacked: 0,
        vitaEarned: 0,
        vitaPledged: 0,
        total: 0,
      }
    }
  }

  // Calcular VITA total agregado de todos los usuarios
  const getTotalVitaInSystem = async (): Promise<number> => {
    try {
      const records = JSON.parse(
        localStorage.getItem('proyecta_vita_records') || '[]'
      ) as VitaRecord[]

      let total = 0
      for (const record of records) {
        if (record.type === 'donation') {
          total += record.amount
        } else if (record.type === 'validation' || record.type === 'published') {
          total += record.amount
        }
      }
      return total
    } catch {
      return 0
    }
  }

  return {
    recordVita,
    loadUserVita,
    getTotalVitaInSystem,
    loading,
    error,
  }
}
