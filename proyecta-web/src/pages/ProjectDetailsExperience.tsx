import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ProjectFundraisingCard } from '../components/ProjectFundraisingCard'
import { ProjectSecurityInfo } from '../components/ProjectSecurityInfo'
import { ProjectComments } from '../components/ProjectComments'

interface Project {
  id: string
  title: string
  description: string
  category: string
  fundingGoal: number
  fundraisingAddress: string
  author: string
  hitos: Array<{ name: string; payout: number }>
  createdAt: number
  status: string
  raised: number
}

export function ProjectDetailsExperience() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      navigate('/projects')
      return
    }

    setLoading(true)
    try {
      const saved = localStorage.getItem('proyecta_projects')
      if (saved) {
        const projects = JSON.parse(saved)
        const found = projects.find((p) => p.id === id)
        if (found) {
          setProject(found)
        }
      }
    } catch (err) {
      console.error('Error loading project:', err)
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="nova-card p-12 text-center space-y-4">
        <p className="text-xl font-bold text-slate-900">Proyecto no encontrado</p>
        <button onClick={() => navigate('/projects')} className="nova-button-solid">
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{project.title}</h1>
          <p className="text-slate-600 mt-2">
            Publicado hace {Math.round((Date.now() - project.createdAt) / 1000 / 60)} minutos
          </p>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="nova-button-soft"
        >
          Volver
        </button>
      </div>

      <ProjectFundraisingCard
        projectId={project.id}
        projectTitle={project.title}
        projectDescription={project.description}
        fundraisingAddress={project.fundraisingAddress}
        goal={project.fundingGoal}
        raised={project.raised}
        hitos={project.hitos}
      />

      <div className="nova-card p-6 space-y-4">
        <h2 className="text-2xl font-bold">Descripción</h2>
        <div
          className="text-slate-700 space-y-4"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
      </div>

      <ProjectComments projectId={project.id} projectAuthor={project.author} />

      <ProjectSecurityInfo />
    </div>
  )
}
