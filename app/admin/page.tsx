'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, Calendar, Users, LogOut, Bot, UserCheck,
  Send, ChevronRight, Search, X, CheckCheck, AlertTriangle,
  Pause, Play, PanelRightOpen, PanelRightClose, CheckCircle,
  XCircle, Clock, CreditCard, Banknote, Smartphone
} from 'lucide-react'
import {
  PACIENTES, TURNOS_HOY, CONVERSACIONES, HISTORIAL_SESIONES,
  Conversacion, Mensaje, TurnoEstado, Turno
} from '@/lib/data'

const ESTADO_LABELS: Record<TurnoEstado, string> = {
  confirmado: 'Confirmado', checkin: 'Check-in ✓', en_consulta: 'En consulta',
  atendido: 'Atendido', cancelado: 'Cancelado', no_vino: 'No vino'
}
const ESTADO_COLORS: Record<TurnoEstado, string> = {
  confirmado: 'bg-blue-100 text-blue-700',
  checkin: 'bg-emerald-100 text-emerald-700',
  en_consulta: 'bg-purple-100 text-purple-700',
  atendido: 'bg-gray-100 text-gray-600',
  cancelado: 'bg-red-100 text-red-600',
  no_vino: 'bg-orange-100 text-orange-600'
}

function getPaciente(id: string) { return PACIENTES.find(p => p.id === id)! }

export default function AdminPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [tab, setTab] = useState<'inbox' | 'agenda' | 'pacientes'>('inbox')
  const [conversaciones, setConversaciones] = useState(CONVERSACIONES)
  const [selectedConv, setSelectedConv] = useState<Conversacion | null>(null)
  const [inputMsg, setInputMsg] = useState('')
  const [turnos, setTurnos] = useState(TURNOS_HOY)
  const [botGlobal, setBotGlobal] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    if (!u.role) { router.push('/'); return }
    if (u.role !== 'admin') { router.push('/profesional'); return }
    setUserName(u.name)
    // Auto-select first conv with unread
    const withUnread = CONVERSACIONES.find(c => c.no_leidos > 0)
    setSelectedConv(withUnread || CONVERSACIONES[0])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConv])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  function toggleModoConv(convId: string) {
    setConversaciones(prev => prev.map(c =>
      c.id === convId ? { ...c, modo: c.modo === 'bot' ? 'humano' : 'bot' } : c
    ))
    setSelectedConv(prev => prev && prev.id === convId
      ? { ...prev, modo: prev.modo === 'bot' ? 'humano' : 'bot' } : prev)
    const conv = conversaciones.find(c => c.id === convId)
    if (conv) showToast(conv.modo === 'bot' ? '🧑 Tomaste el control de la conversación' : '🤖 Bot reactivado en esta conversación')
  }

  function sendMessage() {
    if (!inputMsg.trim() || !selectedConv) return
    const newMsg: Mensaje = {
      id: Date.now().toString(), from: 'admin', texto: inputMsg.trim(),
      hora: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }), leido: true
    }
    const updated = { ...selectedConv, mensajes: [...selectedConv.mensajes, newMsg], ultimo_mensaje: newMsg.texto, ultima_hora: newMsg.hora }
    setSelectedConv(updated)
    setConversaciones(prev => prev.map(c => c.id === selectedConv.id ? updated : c))
    setInputMsg('')
  }

  function cancelarTodosLosTurnos() {
    setTurnos(prev => prev.map(t =>
      t.estado === 'confirmado' || t.estado === 'checkin'
        ? { ...t, estado: 'cancelado' as TurnoEstado }
        : t
    ))
    setCancelConfirm(false)
    showToast('📱 Turnos cancelados. WhatsApp enviado a todos los pacientes.')
  }

  function cambiarEstado(turnoId: string, estado: TurnoEstado) {
    setTurnos(prev => prev.map(t => t.id === turnoId ? { ...t, estado } : t))
  }

  const totalUnread = conversaciones.reduce((s, c) => s + c.no_leidos, 0)

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Cancel confirm modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cancelar agenda</h3>
                <p className="text-sm text-gray-500">Dr. Sebastián Torres — Hoy</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Se cancelarán <strong>los turnos pendientes</strong> del día y se enviará WhatsApp automático a cada paciente avisando la cancelación.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                No cancelar
              </button>
              <button onClick={cancelarTodosLosTurnos} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top nav */}
      <header className="bg-teal-700 text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🏥</span>
          <div>
            <p className="font-semibold text-sm leading-tight">Ciudad Jardín</p>
            <p className="text-teal-200 text-xs">{userName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Bot global toggle */}
          <button
            onClick={() => { setBotGlobal(!botGlobal); showToast(botGlobal ? '⏸ Bot pausado globalmente' : '▶ Bot reactivado') }}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${botGlobal ? 'bg-teal-600 hover:bg-teal-500' : 'bg-orange-500 hover:bg-orange-400'}`}
          >
            {botGlobal ? <><Play className="w-3 h-3" /> Bot activo</> : <><Pause className="w-3 h-3" /> Bot pausado</>}
          </button>
          <button onClick={() => { localStorage.clear(); router.push('/') }} className="p-1.5 hover:bg-teal-600 rounded-lg">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="bg-white border-b border-gray-200 px-4 flex gap-1 shrink-0">
        {([
          { id: 'inbox', label: 'WhatsApp', icon: MessageSquare, badge: totalUnread },
          { id: 'agenda', label: 'Agenda', icon: Calendar, badge: 0 },
          { id: 'pacientes', label: 'Pacientes', icon: Users, badge: 0 },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${tab === t.id ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.badge > 0 && <span className="absolute top-2 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{t.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-hidden">

        {/* ===== INBOX ===== */}
        {tab === 'inbox' && (
          <div className="h-full flex">
            {/* Conversation list */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Buscar conversación...</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {conversaciones.map(conv => {
                  const paciente = getPaciente(conv.paciente_id)
                  const isSelected = selectedConv?.id === conv.id
                  return (
                    <div key={conv.id}
                      onClick={() => {
                        setSelectedConv(conv)
                        setConversaciones(prev => prev.map(c => c.id === conv.id ? { ...c, no_leidos: 0 } : c))
                      }}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${isSelected ? 'bg-teal-50' : 'hover:bg-gray-50'}`}>
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm">
                          {paciente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${conv.modo === 'bot' ? 'bg-teal-500' : 'bg-purple-500'}`}>
                          {conv.modo === 'bot' ? <Bot className="w-2.5 h-2.5 text-white" /> : <UserCheck className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-900 truncate">{paciente.nombre}</span>
                          <span className="text-xs text-gray-400 shrink-0 ml-1">{conv.ultima_hora}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{conv.ultimo_mensaje}</p>
                      </div>
                      {conv.no_leidos > 0 && (
                        <span className="w-5 h-5 bg-teal-500 text-white text-[10px] rounded-full flex items-center justify-center shrink-0 font-medium">{conv.no_leidos}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Chat window */}
            {selectedConv ? (() => {
              const paciente = getPaciente(selectedConv.paciente_id)
              const isHuman = selectedConv.modo === 'humano'
              const historial = HISTORIAL_SESIONES.filter(s => s.paciente_id === paciente.id)
              const sesionesRestantes = paciente.sesiones_total - paciente.sesiones_hechas
              return (
                <div className="flex-1 flex overflow-hidden">
                  {/* Chat area */}
                  <div className="flex-1 flex flex-col bg-[#efeae2]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4c9b8\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                    {/* Chat header */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 shadow-sm shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm">
                          {paciente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{paciente.nombre}</p>
                          <p className="text-xs text-gray-500">{paciente.telefono}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleModoConv(selectedConv.id)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${isHuman ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-teal-100 text-teal-700 hover:bg-teal-200'}`}>
                          {isHuman ? <><UserCheck className="w-3.5 h-3.5" /> Modo manual</> : <><Bot className="w-3.5 h-3.5" /> Modo bot</>}
                        </button>
                        <button
                          onClick={() => setDrawerOpen(o => !o)}
                          title="Ver historial del paciente"
                          className={`p-2 rounded-xl transition-colors ${drawerOpen ? 'bg-teal-100 text-teal-700' : 'hover:bg-gray-100 text-gray-500'}`}>
                          {drawerOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                      {selectedConv.mensajes.map(msg => {
                        const isOutgoing = msg.from === 'bot' || msg.from === 'admin'
                        return (
                          <div key={msg.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${
                              msg.from === 'bot' ? 'bg-white text-gray-800 rounded-tl-sm' :
                              msg.from === 'admin' ? 'bg-teal-600 text-white rounded-tr-sm' :
                              'bg-white text-gray-800 rounded-tl-sm'
                            }`}>
                              {msg.from === 'bot' && <p className="text-[10px] text-teal-600 font-medium mb-0.5">🤖 Bot</p>}
                              {msg.from === 'admin' && <p className="text-[10px] text-teal-100 font-medium mb-0.5">👩‍💼 {userName.split(' ')[0]}</p>}
                              <p className="text-sm leading-relaxed">{msg.texto}</p>
                              <div className={`flex items-center justify-end gap-1 mt-1 ${isOutgoing ? 'opacity-70' : ''}`}>
                                <span className="text-[10px] opacity-60">{msg.hora}</span>
                                {isOutgoing && <CheckCheck className="w-3 h-3 opacity-70" />}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="bg-white px-4 py-3 shrink-0">
                      {!isHuman && (
                        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 mb-2">
                          <Bot className="w-4 h-4 text-teal-600 shrink-0" />
                          <p className="text-xs text-teal-700">El bot está respondiendo automáticamente. Activá modo manual para responder vos.</p>
                          <button onClick={() => toggleModoConv(selectedConv.id)} className="ml-auto text-xs font-medium text-teal-700 hover:underline shrink-0">Tomar control</button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          value={inputMsg}
                          onChange={e => setInputMsg(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                          disabled={!isHuman}
                          placeholder={isHuman ? 'Escribí un mensaje...' : 'Activá modo manual para escribir'}
                          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button onClick={sendMessage} disabled={!isHuman || !inputMsg.trim()}
                          className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ===== DRAWER HISTORIAL ===== */}
                  {drawerOpen && (
                    <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
                      {/* Drawer header */}
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                        <p className="font-semibold text-sm text-gray-900">Ficha del paciente</p>
                        <button onClick={() => setDrawerOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {/* Info paciente */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold shrink-0">
                              {paciente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{paciente.nombre}</p>
                              <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">{paciente.tipo}</span>
                            </div>
                          </div>

                          {/* Sesiones progress */}
                          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">Progreso del plan</span>
                              <span className="text-xs font-bold text-gray-900">{paciente.sesiones_hechas}/{paciente.sesiones_total}</span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div className="bg-teal-500 h-2 rounded-full transition-all"
                                style={{ width: `${(paciente.sesiones_hechas / paciente.sesiones_total) * 100}%` }} />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">{paciente.sesiones_hechas} realizadas</span>
                              <span className={`text-xs font-medium ${sesionesRestantes <= 2 ? 'text-orange-600' : 'text-teal-600'}`}>
                                {sesionesRestantes} pendientes
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Historial de sesiones */}
                        <div className="p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Últimas sesiones</p>

                          {historial.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">Sin sesiones registradas</p>
                          ) : (
                            <div className="space-y-2">
                              {historial.map(s => (
                                <div key={s.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                                  {/* Asistencia */}
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${s.asistio ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                    {s.asistio
                                      ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      : <XCircle className="w-4 h-4 text-red-500" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-800">{s.fecha} · {s.disciplina}</p>
                                    <p className={`text-[11px] ${!s.asistio ? 'text-red-500' : 'text-gray-400'}`}>
                                      {!s.asistio ? 'No asistió' : 'Asistió'}
                                    </p>
                                  </div>
                                  {/* Pago */}
                                  <div className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                    s.pago_estado === 'pagado' ? 'bg-green-100 text-green-700' :
                                    s.pago_estado === 'seña' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-600'
                                  }`}>
                                    {s.pago_estado === 'pagado' ? '✓ Pagó' : s.pago_estado === 'seña' ? '₱ Seña' : '$ Debe'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })() : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Seleccioná una conversación</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== AGENDA ===== */}
        {tab === 'agenda' && (
          <div className="h-full overflow-y-auto p-6 scrollbar-thin">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Agenda del día</h2>
                  <p className="text-sm text-gray-500">Martes 29 de abril · Dr. Sebastián Torres</p>
                </div>
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="flex items-center gap-2 text-sm px-4 py-2 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors border border-red-200">
                  <AlertTriangle className="w-4 h-4" />
                  Cancelar agenda
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total', value: turnos.length, color: 'bg-blue-50 text-blue-700' },
                  { label: 'Atendidos', value: turnos.filter(t => t.estado === 'atendido').length, color: 'bg-green-50 text-green-700' },
                  { label: 'Pendientes', value: turnos.filter(t => ['confirmado', 'checkin'].includes(t.estado)).length, color: 'bg-orange-50 text-orange-700' },
                  { label: 'No vinieron', value: turnos.filter(t => t.estado === 'no_vino').length, color: 'bg-red-50 text-red-700' },
                ].map(s => (
                  <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Turnos */}
              <div className="space-y-3">
                {turnos.map(turno => {
                  const paciente = getPaciente(turno.paciente_id)
                  return (
                    <div key={turno.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="text-center shrink-0 w-14">
                          <p className="text-lg font-bold text-teal-700">{turno.hora}</p>
                        </div>
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm shrink-0">
                          {paciente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{paciente.nombre}</p>
                          <p className="text-xs text-gray-500">{turno.tipo}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Pago badge */}
                          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                            turno.pago_estado === 'pagado' ? 'bg-green-100 text-green-700' :
                            turno.pago_estado.startsWith('seña') ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {turno.pago_estado === 'pagado' ? '✓ Pagado' :
                             turno.pago_estado === 'seña_mp' ? '₱ Seña MP' :
                             turno.pago_estado === 'seña_efectivo' ? '$ Seña' : '$ Pendiente'}
                          </span>
                          {/* Estado */}
                          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${ESTADO_COLORS[turno.estado]}`}>
                            {ESTADO_LABELS[turno.estado]}
                          </span>
                          {/* Cambiar estado */}
                          {turno.estado === 'confirmado' && (
                            <button onClick={() => cambiarEstado(turno.id, 'en_consulta')}
                              className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
                              Iniciar
                            </button>
                          )}
                          {turno.estado === 'checkin' && (
                            <button onClick={() => cambiarEstado(turno.id, 'en_consulta')}
                              className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                              Llamar →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== PACIENTES ===== */}
        {tab === 'pacientes' && (
          <div className="h-full overflow-y-auto p-6 scrollbar-thin">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Pacientes</h2>
                <button className="text-sm px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700">
                  + Nuevo paciente
                </button>
              </div>
              <div className="space-y-3">
                {PACIENTES.map(p => {
                  const conv = conversaciones.find(c => c.paciente_id === p.id)
                  return (
                    <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold shrink-0">
                          {p.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm">{p.nombre}</p>
                            <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">{p.tipo}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{p.telefono} · DNI {p.dni}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-900">{p.sesiones_hechas}/{p.sesiones_total}</p>
                          <p className="text-xs text-gray-500">sesiones</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {conv && (
                            <button onClick={() => { setTab('inbox'); setSelectedConv(conv) }}
                              className="p-2 hover:bg-teal-50 rounded-xl transition-colors" title="Ver chat">
                              <MessageSquare className="w-4 h-4 text-teal-600" />
                            </button>
                          )}
                          <button className="p-2 hover:bg-gray-50 rounded-xl">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      {/* Sesiones progress bar */}
                      <div className="mt-3 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-teal-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(p.sesiones_hechas / p.sesiones_total) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
