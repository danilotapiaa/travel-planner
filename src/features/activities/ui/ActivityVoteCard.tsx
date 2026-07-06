'use client'

import { useState } from 'react'
import { MapPin, DollarSign, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { voteActivity } from '../actions'

type ActivityApproval = {
  user_id: string
  status: 'APPROVED' | 'REJECTED'
}

type ActivityVoteItem = {
  id: string
  title: string
  description: string | null
  place_id: string
  price: number | null
  activity_approvals?: ActivityApproval[]
}

type ActivityProps = {
  activity: ActivityVoteItem
  currentUserId: string
}

export function ActivityVoteCard({ activity, currentUserId }: ActivityProps) {
  const [isVoting, setIsVoting] = useState(false)

  // Verificar si el usuario actual ya emitió un voto
  const myVote = activity.activity_approvals?.find((approval) => approval.user_id === currentUserId)
  const hasVoted = !!myVote

  const handleVote = async (status: 'APPROVED' | 'REJECTED') => {
    setIsVoting(true)
    await voteActivity(activity.id, status)
    setIsVoting(false)
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-md relative overflow-hidden">
      {/* Indicador lateral de estado */}
      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
      
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-white text-lg leading-tight">{activity.title}</h4>
        <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-500/20">
          Pendiente
        </span>
      </div>

      <p className="text-sm text-slate-400 mb-4">{activity.description}</p>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/50 p-2 rounded-md border border-slate-800">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span className="truncate" title={activity.place_id}>{activity.place_id.split(',')[0]}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/50 p-2 rounded-md border border-slate-800">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          <span>{(activity.price ?? 0) > 0 ? `${activity.price} USD` : 'Gratis'}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800">
        {hasVoted ? (
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 bg-yellow-900/10 py-2 rounded-md">
            <Clock className="h-4 w-4" />
            <span>Esperando a tu acompañante...</span>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => handleVote('REJECTED')}
              disabled={isVoting}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-400 py-2 rounded-md transition-colors text-sm font-medium border border-slate-700 hover:border-red-800 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> Rechazar
            </button>
            <button
              onClick={() => handleVote('APPROVED')}
              disabled={isVoting}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md transition-colors text-sm font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Aprobar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}