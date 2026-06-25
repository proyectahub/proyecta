import { useState, useEffect } from 'react'
import { useWalletAuth } from '../context/WalletAuthContext'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'
import { MessageCircle, Trash2, Reply } from 'lucide-react'

interface Comment {
  id: string
  author: string
  authorId: string
  content: string
  timestamp: number
  replies: Comment[]
}

interface ProjectCommentsProps {
  projectId: string
  projectAuthor: string
}

export function ProjectComments({ projectId, projectAuthor }: ProjectCommentsProps) {
  const { user: walletUser } = useWalletAuth()
  const { user: traditionalUser } = useTraditionalAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const currentUserId = traditionalUser?.id || walletUser?.wallet?.userVitaAddress || 'anonymous'
  const currentUserName = traditionalUser?.fullName || walletUser?.wallet?.userVitaAddress?.slice(0, 16) || 'Anónimo'

  // Cargar comentarios del localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`project_comments_${projectId}`)
    if (stored) {
      try {
        setComments(JSON.parse(stored))
      } catch (err) {
        console.error('Error loading comments:', err)
      }
    }
  }, [projectId])

  // Guardar comentarios en localStorage
  const saveComments = (newComments: Comment[]) => {
    setComments(newComments)
    localStorage.setItem(`project_comments_${projectId}`, JSON.stringify(newComments))
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      author: currentUserName,
      authorId: currentUserId,
      content: newComment,
      timestamp: Date.now(),
      replies: [],
    }

    saveComments([comment, ...comments])
    setNewComment('')
  }

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return

    const reply: Comment = {
      id: `reply_${Date.now()}`,
      author: currentUserName,
      authorId: currentUserId,
      content: replyText,
      timestamp: Date.now(),
      replies: [],
    }

    const updateCommentReplies = (items: Comment[]): Comment[] => {
      return items.map((item) => {
        if (item.id === commentId) {
          return { ...item, replies: [reply, ...item.replies] }
        }
        return { ...item, replies: updateCommentReplies(item.replies) }
      })
    }

    saveComments(updateCommentReplies(comments))
    setReplyingTo(null)
    setReplyText('')
  }

  const handleDeleteComment = (commentId: string) => {
    const deleteComment = (items: Comment[]): Comment[] => {
      return items
        .filter((item) => item.id !== commentId)
        .map((item) => ({
          ...item,
          replies: deleteComment(item.replies),
        }))
    }

    saveComments(deleteComment(comments))
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Hace poco'
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days}d`
    return date.toLocaleDateString('es-ES')
  }

  const CommentItem = ({ comment, level = 0, isReply = false }: { comment: Comment; level?: number; isReply?: boolean }) => {
    const isAuthor = currentUserId === comment.authorId
    const isProjectAuthor = currentUserId === projectAuthor

    return (
      <div key={comment.id} className={`${level > 0 ? 'ml-6 border-l-2 border-slate-300 pl-4' : ''} space-y-3`}>
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-slate-900">
                {comment.author}
                {isProjectAuthor && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    👨‍🔬 Autor del proyecto
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500">{formatDate(comment.timestamp)}</p>
            </div>

            {isAuthor && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-500 hover:text-red-700 p-2"
                title="Eliminar comentario"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="text-slate-700">{comment.content}</p>

          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Reply className="h-3 w-3" />
            Responder
          </button>
        </div>

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} level={level + 1} isReply={true} />
            ))}
          </div>
        )}

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-200 ml-6">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Escribe tu respuesta..."
              rows={3}
              className="nova-field"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setReplyingTo(null)
                  setReplyText('')
                }}
                className="nova-button-soft flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAddReply(comment.id)}
                disabled={!replyText.trim()}
                className="nova-button-solid flex-1 disabled:opacity-40"
              >
                Responder
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Comentarios ({comments.length})
        </h3>

        {/* Nuevo comentario */}
        {currentUserId !== 'anonymous' ? (
          <div className="nova-card p-6 space-y-3 bg-blue-50 border-2 border-blue-200">
            <p className="text-sm font-bold text-slate-700">Comentar como: <span className="text-blue-600">{currentUserName}</span></p>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="¿Qué piensas sobre este proyecto? Comparte tu opinión, preguntas, o sugerencias..."
              rows={3}
              className="nova-field"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setNewComment('')}
                className="nova-button-soft"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="nova-button-solid disabled:opacity-40"
              >
                Comentar
              </button>
            </div>
          </div>
        ) : (
          <div className="nova-card p-6 bg-amber-50 border-2 border-amber-200">
            <p className="text-sm text-amber-800">
              ℹ️ <strong>Inicia sesión para comentar</strong> y compartir tu opinión sobre este proyecto.
            </p>
          </div>
        )}

        {/* Lista de comentarios */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="nova-card p-8 text-center text-slate-500">
            <p>📝 No hay comentarios aún. ¡Sé el primero en comentar!</p>
          </div>
        )}
      </div>
    </div>
  )
}
