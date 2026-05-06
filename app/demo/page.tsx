'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, CheckCheck, ExternalLink, Loader2 } from 'lucide-react'

type Mensaje = {
  id: string
  from: 'bot' | 'user'
  texto: string
  hora: string
  link?: string
  opciones?: string[]
}

type Paso =
  | 'inicio'
  | 'elegir_especialidad'
  | 'tiene_orden'
  | 'tiene_cobertura'
  | 'elegir_horario'
  | 'generando_pago'
  | 'pago_listo'
  | 'fin'

const ESPECIALIDADES = [
  { label: 'Kinesiología', profesional: 'Dr. Sebastián Torres', flujo: 'orden', monto: 5000 },
  { label: 'Traumatología', profesional: 'Dr. Alejandro Meni', flujo: 'cobertura', monto: 6000 },
  { label: 'Osteopatía', profesional: 'Lic. Nicolás Vera', flujo: 'orden', monto: 5500 },
  { label: 'RPG', profesional: 'Lic. Nicolás Vera', flujo: 'orden', monto: 5500 },
  { label: 'Nutrición', profesional: 'Lic. Florencia Paz', flujo: 'cobertura', monto: 4500 },
  { label: 'Masaje Deportivo', profesional: 'Lic. Hernán Díaz', flujo: 'directo', monto: 4000 },
  { label: 'Medicina Deportiva', profesional: 'Dr. Alejandro Meni', flujo: 'cobertura', monto: 6000 },
  { label: 'Osteoporosis', profesional: 'Dr. Alejandro Meni', flujo: 'cobertura', monto: 6000 },
  { label: 'Rehabilitación Piso', profesional: 'Dr. Sebastián Torres', flujo: 'orden', monto: 5000 },
  { label: 'ATM', profesional: 'Dr. Sebastián Torres', flujo: 'orden', monto: 5000 },
  { label: 'Rehabilitación Deportiva', profesional: 'Dr. Sebastián Torres', flujo: 'orden', monto: 5000 },
]

const HORARIOS = [
  'Lunes 9:00', 'Lunes 10:00', 'Martes 11:00',
  'Miércoles 9:00', 'Jueves 14:00', 'Viernes 10:00'
]

function hora() {
  return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function DemoContent() {
  const searchParams = useSearchParams()
  const pagoParam = searchParams.get('pago')

  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [paso, setPaso] = useState<Paso>('inicio')
  const [input, setInput] = useState('')
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<typeof ESPECIALIDADES[0] | null>(null)
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('')
  const [cargandoPago, setCargandoPago] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensajes])

  useEffect(() => {
    // Mensaje de bienvenida al cargar
    setTimeout(() => agregarBot(
      '¡Hola! 👋 Bienvenido al *Policonsultorio Ciudad Jardín*.\n\nSoy el asistente virtual. ¿En qué puedo ayudarte hoy?',
      ['Necesito un turno', 'Consulta sobre precios', 'Dirección y horarios', 'Hablar con una administrativa']
    ), 600)
    setPaso('inicio')
  }, [])

  useEffect(() => {
    if (pagoParam === 'aprobado') {
      agregarBot('✅ *¡Seña recibida con éxito!*\n\nTu turno está confirmado. Te mandamos los detalles por este chat. ¡Hasta pronto! 😊')
      setPaso('fin')
    }
  }, [pagoParam])

  function agregarBot(texto: string, opciones?: string[], link?: string) {
    const msg: Mensaje = { id: Date.now().toString(), from: 'bot', texto, hora: hora(), opciones, link }
    setMensajes(prev => [...prev, msg])
  }

  function agregarUser(texto: string) {
    const msg: Mensaje = { id: Date.now().toString(), from: 'user', texto, hora: hora() }
    setMensajes(prev => [...prev, msg])
  }

  function handleOpcion(opcion: string) {
    agregarUser(opcion)

    if (paso === 'inicio') {
      if (opcion === 'Necesito un turno') {
        setTimeout(() => {
          agregarBot(
            '¡Perfecto! ¿Para qué especialidad necesitás el turno?',
            ESPECIALIDADES.map(e => e.label)
          )
          setPaso('elegir_especialidad')
        }, 600)
      } else if (opcion === 'Dirección y horarios') {
        setTimeout(() => {
          agregarBot('📍 Estamos en *Tucumán 2153 entre Mitre y Matheu*, San Martín, Bs.As.\n\n🕐 *Horario de atención:*\nLunes a Viernes de 8 a 19hs\nSábados de 8 a 14hs')
          setPaso('fin')
        }, 600)
      } else if (opcion === 'Consulta sobre precios') {
        setTimeout(() => {
          agregarBot('💰 Los valores varían según la especialidad y si tenés cobertura médica.\n\nContame, ¿qué especialidad te interesa?', ESPECIALIDADES.map(e => e.label))
          setPaso('elegir_especialidad')
        }, 600)
      } else {
        setTimeout(() => {
          agregarBot('Enseguida te comunico con una administrativa 👩‍💼\n\nNuestro horario de atención es *Lunes a Viernes de 8 a 13hs*.')
          setPaso('fin')
        }, 600)
      }
      return
    }

    if (paso === 'elegir_especialidad') {
      const esp = ESPECIALIDADES.find(e => e.label === opcion)
      if (!esp) return
      setEspecialidadSeleccionada(esp)

      setTimeout(() => {
        if (esp.flujo === 'directo') {
          agregarBot(
            `Genial! Para *${esp.label}* con *${esp.profesional}* no necesitás orden médica. 🎉\n\nElegí el horario que más te convenga:`,
            HORARIOS
          )
          setPaso('elegir_horario')
        } else if (esp.flujo === 'orden') {
          agregarBot(`Para *${esp.label}* con *${esp.profesional}*, ¿contás con orden médica?`, ['Sí, tengo orden', 'No tengo orden'])
          setPaso('tiene_orden')
        } else {
          agregarBot(`Para *${esp.label}* con *${esp.profesional}*, ¿tenés cobertura médica?`, ['Sí, tengo cobertura', 'No, soy particular'])
          setPaso('tiene_cobertura')
        }
      }, 700)
      return
    }

    if (paso === 'tiene_orden') {
      if (opcion === 'Sí, tengo orden') {
        setTimeout(() => {
          agregarBot(`Perfecto! 📋 Recordá traer la orden el día del turno.\n\nElegí el horario que más te convenga:`, HORARIOS)
          setPaso('elegir_horario')
        }, 600)
      } else {
        setTimeout(() => {
          agregarBot(`No hay problema, podés atenderte como particular. 😊\n\nElegí el horario que más te convenga:`, HORARIOS)
          setPaso('elegir_horario')
        }, 600)
      }
      return
    }

    if (paso === 'tiene_cobertura') {
      if (opcion === 'Sí, tengo cobertura') {
        setTimeout(() => {
          agregarBot(`Trabajamos con *PAMI, IOMA, OSDE y otras obras sociales*. 🏥\n\nElegí el horario que más te convenga:`, HORARIOS)
          setPaso('elegir_horario')
        }, 600)
      } else {
        setTimeout(() => {
          agregarBot(`Sin problema, podés atenderte como particular. Elegí el horario:`, HORARIOS)
          setPaso('elegir_horario')
        }, 600)
      }
      return
    }

    if (paso === 'elegir_horario') {
      setHorarioSeleccionado(opcion)
      setPaso('generando_pago')

      setTimeout(() => {
        agregarBot(`✅ Turno *${opcion}* con *${especialidadSeleccionada?.profesional}*.\n\nPara confirmar el turno necesitamos una seña de *$${especialidadSeleccionada?.monto.toLocaleString()}*.\n\nGenerando link de pago... 🔄`)
        setCargandoPago(true)
      }, 700)

      // Llamar a la API route
      setTimeout(async () => {
        try {
          const res = await fetch('/api/crear-pago', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              especialidad: especialidadSeleccionada?.label,
              profesional: especialidadSeleccionada?.profesional,
              horario: opcion,
              monto: especialidadSeleccionada?.monto,
            }),
          })
          const data = await res.json()
          setCargandoPago(false)

          if (data.url) {
            agregarBot(
              `💳 ¡Listo! Tu link de pago está listo. Tenés *48 horas* para abonar la seña y confirmar el turno.`,
              undefined,
              data.url
            )
            setPaso('pago_listo')
          } else {
            agregarBot('Hubo un problema generando el link. Por favor contactá a la administrativa.')
          }
        } catch {
          setCargandoPago(false)
          agregarBot('Error al conectar con Mercado Pago. Intentá de nuevo.')
        }
      }, 2000)
    }
  }

  function handleSend() {
    if (!input.trim()) return
    agregarUser(input)
    setInput('')
    setTimeout(() => {
      agregarBot('Entendido 👍 Si necesitás algo más escribinos o elegí una opción.', ['Necesito un turno', 'Hablar con una administrativa'])
      setPaso('inicio')
    }, 700)
  }

  const ultimoConOpciones = [...mensajes].reverse().find(m => m.opciones && m.opciones.length > 0)

  return (
    <div className="h-screen flex flex-col max-w-sm mx-auto bg-white shadow-xl">
      {/* Header WhatsApp style */}
      <div className="bg-teal-700 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">CJ</div>
        <div>
          <p className="text-white font-semibold text-sm">Policonsultorio Ciudad Jardín</p>
          <p className="text-teal-200 text-xs">Bot de turnos · en línea</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4c9b8\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundColor: '#efeae2' }}>
        {mensajes.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl shadow-sm text-sm ${msg.from === 'user' ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm'}`}>
              <p className="whitespace-pre-line leading-relaxed">
                {msg.texto.split(/\*(.*?)\*/g).map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </p>
              {msg.link && (
                <a href={msg.link} target="_blank" rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 bg-teal-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  Pagar seña — ${especialidadSeleccionada?.monto.toLocaleString()}
                </a>
              )}
              <div className={`flex items-center justify-end gap-1 mt-1 opacity-60`}>
                <span className="text-[10px]">{msg.hora}</span>
                {msg.from === 'user' && <CheckCheck className="w-3 h-3" />}
              </div>
            </div>

            {/* Opciones del último mensaje del bot */}
            {msg.from === 'bot' && msg.opciones && msg === ultimoConOpciones && paso !== 'fin' && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                {msg.opciones.map(op => (
                  <button key={op} onClick={() => handleOpcion(op)}
                    className="text-xs px-3 py-1.5 bg-white border border-teal-400 text-teal-700 rounded-full font-medium hover:bg-teal-50 active:bg-teal-100 transition-colors shadow-sm">
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {cargandoPago && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
              <span className="text-sm text-gray-500">Generando link de pago...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="bg-white px-3 py-3 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Escribí un mensaje..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none"
          />
          <button onClick={handleSend} disabled={!input.trim()}
            className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 disabled:opacity-40 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DemoPage() {
  return (
    <Suspense>
      <DemoContent />
    </Suspense>
  )
}
