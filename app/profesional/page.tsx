'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  QrCode, LogOut, Bell, CheckCircle, Clock, UserX,
  ChevronRight, CreditCard, Banknote, Smartphone, Check
} from 'lucide-react'
import { PACIENTES, TURNOS_HOY, Turno, TurnoEstado } from '@/lib/data'

const ESTADO_LABELS: Record<TurnoEstado, string> = {
  confirmado: 'Esperando', checkin: 'Llegó ✓', en_consulta: 'En consulta',
  atendido: 'Atendido', cancelado: 'Cancelado', no_vino: 'No vino'
}
const ESTADO_COLORS: Record<TurnoEstado, string> = {
  confirmado: 'bg-gray-100 text-gray-600',
  checkin: 'bg-emerald-100 text-emerald-700',
  en_consulta: 'bg-purple-100 text-purple-700',
  atendido: 'bg-blue-100 text-blue-600',
  cancelado: 'bg-red-100 text-red-600',
  no_vino: 'bg-orange-100 text-orange-600'
}

function getPaciente(id: string) { return PACIENTES.find(p => p.id === id)! }

export default function ProfesionalPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [turnos, setTurnos] = useState(TURNOS_HOY)
  const [notification, setNotification] = useState<{ nombre: string; hora: string } | null>(null)
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    if (!u.role) { router.push('/'); return }
    if (u.role !== 'profesional') { router.push('/admin'); return }
    setUserName(u.name)
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function simulateCheckin() {
    // Simula que Ana Rodriguez escaneó el QR (turno t5, 14:00)
    const turno = turnos.find(t => t.id === 't5')
    if (!turno || turno.estado !== 'confirmado') {
      showToast('No hay turnos confirmados para simular'); return
    }
    const paciente = getPaciente(turno.paciente_id)
    setTurnos(prev => prev.map(t => t.id === 't5' ? { ...t, estado: 'checkin' as TurnoEstado } : t))
    setNotification({ nombre: paciente.nombre, hora: turno.hora })
    setTimeout(() => setNotification(null), 6000)
  }

  function cambiarEstado(turnoId: string, estado: TurnoEstado) {
    setTurnos(prev => prev.map(t => t.id === turnoId ? { ...t, estado } : t))
    if (estado === 'atendido') { setSelectedTurno(null); showToast('✓ Sesión registrada') }
  }

  const turnoActual = turnos.find(t => t.estado === 'en_consulta')
  const proximos = turnos.filter(t => ['confirmado', 'checkin'].includes(t.estado))
  const atendidos = turnos.filter(t => t.estado === 'atendido')
  const cobrosHoy = atendidos.reduce((s, t) => s + t.monto, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm">
          {toast}
        </div>
      )}

      {/* QR Check-in notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-400 p-4 animate-in slide-in-from-top-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">¡Paciente en sala de espera!</p>
                <p className="text-emerald-700 font-medium">{notification.nombre}</p>
                <p className="text-xs text-gray-500">Turno {notification.hora} · Escaneó QR</p>
              </div>
              <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
                <Check className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  cambiarEstado('t5', 'en_consulta')
                  setNotification(null)
                }}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-emerald-700">
                Llamar al paciente
              </button>
              <button onClick={() => setNotification(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
                Después
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detalle de turno modal */}
      {selectedTurno && (() => {
        const paciente = getPaciente(selectedTurno.paciente_id)
        return (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm shadow-xl pb-safe">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-900">Detalle del turno</h3>
                  <button onClick={() => setSelectedTurno(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg">
                    {paciente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{paciente.nombre}</p>
                    <p className="text-sm text-gray-500">{selectedTurno.tipo} · {selectedTurno.hora}</p>
                    <p className="text-xs text-gray-400">Sesión {paciente.sesiones_hechas + 1} de {paciente.sesiones_total}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Monto sesión</span>
                    <span className="font-semibold">${selectedTurno.monto.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estado pago</span>
                    <span className={`font-medium ${selectedTurno.pago_estado === 'pendiente' ? 'text-orange-600' : 'text-green-600'}`}>
                      {selectedTurno.pago_estado === 'pendiente' ? 'Pendiente' :
                       selectedTurno.pago_estado === 'seña_mp' ? 'Seña MP ✓' :
                       selectedTurno.pago_estado === 'seña_efectivo' ? 'Seña efectivo ✓' : 'Pagado ✓'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estado</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[selectedTurno.estado]}`}>
                      {ESTADO_LABELS[selectedTurno.estado]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedTurno.estado === 'checkin' && (
                    <button onClick={() => { cambiarEstado(selectedTurno.id, 'en_consulta'); setSelectedTurno(null) }}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-purple-700">
                      Iniciar consulta
                    </button>
                  )}
                  {selectedTurno.estado === 'en_consulta' && (
                    <button onClick={() => cambiarEstado(selectedTurno.id, 'atendido')}
                      className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-teal-700">
                      ✓ Finalizar sesión
                    </button>
                  )}
                  {selectedTurno.estado === 'confirmado' && (
                    <>
                      <button onClick={() => cambiarEstado(selectedTurno.id, 'no_vino')}
                        className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">
                        No vino
                      </button>
                      <button onClick={() => { cambiarEstado(selectedTurno.id, 'en_consulta'); setSelectedTurno(null) }}
                        className="flex-1 bg-teal-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-700">
                        Iniciar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Header */}
      <header className="bg-teal-700 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{userName}</p>
            <p className="text-teal-200 text-sm">Martes 29 de abril</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={simulateCheckin}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-xl font-medium transition-colors"
              title="Simula que un paciente escaneó el QR">
              <QrCode className="w-3.5 h-3.5" />
              Simular QR
            </button>
            <button onClick={() => { localStorage.clear(); router.push('/') }} className="p-2 hover:bg-teal-600 rounded-xl">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats del día */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Atendidos', value: atendidos.length, icon: CheckCircle },
            { label: 'Por ver', value: proximos.length, icon: Clock },
            { label: 'Cobros', value: `$${(cobrosHoy / 1000).toFixed(0)}k`, icon: CreditCard },
          ].map(s => (
            <div key={s.label} className="bg-teal-600/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-teal-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-lg mx-auto">

        {/* En consulta ahora */}
        {turnoActual && (() => {
          const p = getPaciente(turnoActual.paciente_id)
          return (
            <div className="bg-purple-600 text-white rounded-2xl p-4">
              <p className="text-xs font-medium text-purple-200 mb-2">EN CONSULTA AHORA</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold">
                  {p.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{p.nombre}</p>
                  <p className="text-purple-200 text-sm">{turnoActual.tipo} · {turnoActual.hora}</p>
                </div>
                <button
                  onClick={() => setSelectedTurno(turnoActual)}
                  className="bg-white text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-50">
                  Finalizar
                </button>
              </div>
            </div>
          )
        })()}

        {/* Próximos turnos */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Próximos turnos</h3>
          <div className="space-y-2">
            {proximos.length === 0 && (
              <div className="bg-white rounded-xl p-4 text-center text-gray-400 text-sm">No hay más turnos pendientes</div>
            )}
            {proximos.map(turno => {
              const p = getPaciente(turno.paciente_id)
              const isCheckin = turno.estado === 'checkin'
              return (
                <div key={turno.id}
                  onClick={() => setSelectedTurno(turno)}
                  className={`bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow border ${isCheckin ? 'border-emerald-300 bg-emerald-50' : 'border-gray-100'}`}>
                  <div className="text-center w-12 shrink-0">
                    <p className="font-bold text-teal-700 text-base">{turno.hora}</p>
                  </div>
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm shrink-0">
                    {p.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{turno.tipo} · Sesión {p.sesiones_hechas + 1}/{p.sesiones_total}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${ESTADO_COLORS[turno.estado]}`}>
                      {ESTADO_LABELS[turno.estado]}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Atendidos */}
        {atendidos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Ya atendidos hoy</h3>
            <div className="space-y-2">
              {atendidos.map(turno => {
                const p = getPaciente(turno.paciente_id)
                return (
                  <div key={turno.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3 opacity-70 border border-gray-100">
                    <p className="font-bold text-gray-400 text-sm w-12 text-center shrink-0">{turno.hora}</p>
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-semibold text-xs shrink-0">
                      {p.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium">{p.nombre}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {turno.pago_metodo === 'mercadopago' && <Smartphone className="w-3.5 h-3.5 text-blue-500" />}
                      {turno.pago_metodo === 'transferencia' && <CreditCard className="w-3.5 h-3.5 text-green-500" />}
                      {turno.pago_metodo === 'efectivo' && <Banknote className="w-3.5 h-3.5 text-gray-500" />}
                      <span className="text-xs text-gray-400">${turno.monto.toLocaleString()}</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
