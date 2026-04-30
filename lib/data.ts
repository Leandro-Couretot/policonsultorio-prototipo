export type Role = 'admin' | 'profesional'

export const USERS = [
  { email: 'admin@ciudadjardín.com', password: 'admin123', role: 'admin' as Role, name: 'Valentina Ríos' },
  { email: 'sebastian@ciudadjardín.com', password: 'prof123', role: 'profesional' as Role, name: 'Dr. Sebastián Torres' },
]

export type TurnoEstado = 'confirmado' | 'checkin' | 'en_consulta' | 'atendido' | 'cancelado' | 'no_vino'
export type PagoEstado = 'pendiente' | 'pagado' | 'seña_mp' | 'seña_efectivo'
export type PagoMetodo = 'efectivo' | 'transferencia' | 'mercadopago'

export interface Paciente {
  id: string
  nombre: string
  telefono: string
  dni: string
  tipo: string
  sesiones_total: number
  sesiones_hechas: number
  ultima_sesion: string
}

export interface Turno {
  id: string
  paciente_id: string
  hora: string
  tipo: string
  estado: TurnoEstado
  pago_estado: PagoEstado
  pago_metodo?: PagoMetodo
  monto: number
  profesional: string
  notas?: string
}

export interface Mensaje {
  id: string
  from: 'paciente' | 'bot' | 'admin'
  texto: string
  hora: string
  leido: boolean
}

export interface Conversacion {
  id: string
  paciente_id: string
  modo: 'bot' | 'humano'
  ultimo_mensaje: string
  ultima_hora: string
  no_leidos: number
  mensajes: Mensaje[]
}

export const PACIENTES: Paciente[] = [
  { id: 'p1', nombre: 'María González', telefono: '+54 9 11 4521-8834', dni: '28.341.221', tipo: 'Kinesiología', sesiones_total: 12, sesiones_hechas: 4, ultima_sesion: '2026-04-22' },
  { id: 'p2', nombre: 'Carlos Fernández', telefono: '+54 9 11 6633-4412', dni: '31.882.009', tipo: 'RPG', sesiones_total: 8, sesiones_hechas: 8, ultima_sesion: '2026-04-29' },
  { id: 'p3', nombre: 'Laura Martínez', telefono: '+54 9 11 2244-7798', dni: '35.001.445', tipo: 'Kinesiología', sesiones_total: 10, sesiones_hechas: 2, ultima_sesion: '2026-04-15' },
  { id: 'p4', nombre: 'Diego Pérez', telefono: '+54 9 11 5577-2231', dni: '29.774.118', tipo: 'Estética', sesiones_total: 6, sesiones_hechas: 1, ultima_sesion: '2026-04-29' },
  { id: 'p5', nombre: 'Ana Rodríguez', telefono: '+54 9 11 8890-3345', dni: '33.215.667', tipo: 'Kinesiología', sesiones_total: 15, sesiones_hechas: 0, ultima_sesion: '-' },
  { id: 'p6', nombre: 'Martín López', telefono: '+54 9 11 7712-5590', dni: '27.998.334', tipo: 'RPG', sesiones_total: 8, sesiones_hechas: 5, ultima_sesion: '2026-04-29' },
]

export const TURNOS_HOY: Turno[] = [
  { id: 't1', paciente_id: 'p1', hora: '09:00', tipo: 'Kinesiología', estado: 'atendido', pago_estado: 'pagado', pago_metodo: 'transferencia', monto: 15000, profesional: 'Dr. Sebastián Torres' },
  { id: 't2', paciente_id: 'p2', hora: '10:00', tipo: 'RPG', estado: 'atendido', pago_estado: 'seña_mp', pago_metodo: 'mercadopago', monto: 18000, profesional: 'Dr. Sebastián Torres' },
  { id: 't3', paciente_id: 'p3', hora: '11:00', tipo: 'Kinesiología', estado: 'no_vino', pago_estado: 'pendiente', monto: 15000, profesional: 'Dr. Sebastián Torres' },
  { id: 't4', paciente_id: 'p4', hora: '12:00', tipo: 'Estética', estado: 'checkin', pago_estado: 'pendiente', monto: 20000, profesional: 'Dr. Sebastián Torres' },
  { id: 't5', paciente_id: 'p5', hora: '14:00', tipo: 'Kinesiología', estado: 'confirmado', pago_estado: 'pendiente', monto: 15000, profesional: 'Dr. Sebastián Torres' },
  { id: 't6', paciente_id: 'p6', hora: '15:00', tipo: 'RPG', estado: 'confirmado', pago_estado: 'seña_efectivo', monto: 18000, profesional: 'Dr. Sebastián Torres' },
]

export interface Sesion {
  id: string
  paciente_id: string
  fecha: string
  disciplina: string
  asistio: boolean
  pago_estado: 'pagado' | 'pendiente' | 'seña'
  monto: number
}

export const HISTORIAL_SESIONES: Sesion[] = [
  { id: 's1', paciente_id: 'p1', fecha: '22/04', disciplina: 'Kinesiología', asistio: true, pago_estado: 'pagado', monto: 15000 },
  { id: 's2', paciente_id: 'p1', fecha: '17/04', disciplina: 'Kinesiología', asistio: true, pago_estado: 'pagado', monto: 15000 },
  { id: 's3', paciente_id: 'p1', fecha: '10/04', disciplina: 'Kinesiología', asistio: false, pago_estado: 'pendiente', monto: 15000 },
  { id: 's4', paciente_id: 'p1', fecha: '03/04', disciplina: 'Kinesiología', asistio: true, pago_estado: 'pagado', monto: 15000 },

  { id: 's5', paciente_id: 'p2', fecha: '29/04', disciplina: 'RPG', asistio: true, pago_estado: 'seña', monto: 18000 },
  { id: 's6', paciente_id: 'p2', fecha: '22/04', disciplina: 'RPG', asistio: true, pago_estado: 'pagado', monto: 18000 },
  { id: 's7', paciente_id: 'p2', fecha: '15/04', disciplina: 'RPG', asistio: true, pago_estado: 'pagado', monto: 18000 },
  { id: 's8', paciente_id: 'p2', fecha: '08/04', disciplina: 'RPG', asistio: false, pago_estado: 'pendiente', monto: 18000 },
  { id: 's9', paciente_id: 'p2', fecha: '01/04', disciplina: 'RPG', asistio: true, pago_estado: 'pagado', monto: 18000 },

  { id: 's10', paciente_id: 'p3', fecha: '15/04', disciplina: 'Kinesiología', asistio: true, pago_estado: 'pagado', monto: 15000 },
  { id: 's11', paciente_id: 'p3', fecha: '08/04', disciplina: 'Kinesiología', asistio: false, pago_estado: 'pendiente', monto: 15000 },

  { id: 's12', paciente_id: 'p4', fecha: '29/04', disciplina: 'Estética', asistio: true, pago_estado: 'seña', monto: 20000 },

  { id: 's13', paciente_id: 'p6', fecha: '22/04', disciplina: 'RPG', asistio: true, pago_estado: 'pagado', monto: 18000 },
  { id: 's14', paciente_id: 'p6', fecha: '15/04', disciplina: 'RPG', asistio: true, pago_estado: 'pagado', monto: 18000 },
  { id: 's15', paciente_id: 'p6', fecha: '08/04', disciplina: 'RPG', asistio: false, pago_estado: 'pendiente', monto: 18000 },
  { id: 's16', paciente_id: 'p6', fecha: '01/04', disciplina: 'RPG', asistio: true, pago_estado: 'pagado', monto: 18000 },
  { id: 's17', paciente_id: 'p6', fecha: '25/03', disciplina: 'RPG', asistio: true, pago_estado: 'pagado', monto: 18000 },
]

export const CONVERSACIONES: Conversacion[] = [
  {
    id: 'c1', paciente_id: 'p1', modo: 'bot', ultimo_mensaje: 'Tu turno está confirmado para mañana a las 9:00 ✅', ultima_hora: '10:23', no_leidos: 0,
    mensajes: [
      { id: 'm1', from: 'paciente', texto: 'Hola! quería consultar si tengo turno mañana', hora: '10:20', leido: true },
      { id: 'm2', from: 'bot', texto: 'Hola María 👋 Sí, tenés turno mañana martes 29 a las 9:00 con Dr. Sebastián Torres. ¿Confirmás?', hora: '10:20', leido: true },
      { id: 'm3', from: 'paciente', texto: 'Sí confirmo!', hora: '10:22', leido: true },
      { id: 'm4', from: 'bot', texto: 'Tu turno está confirmado para mañana a las 9:00 ✅', hora: '10:23', leido: true },
    ]
  },
  {
    id: 'c2', paciente_id: 'p2', modo: 'humano', ultimo_mensaje: 'Ok Carlos, te paso el CBU ahora', ultima_hora: '11:45', no_leidos: 1,
    mensajes: [
      { id: 'm1', from: 'paciente', texto: 'Buen día, ¿puedo cambiar el turno de hoy para el jueves?', hora: '11:30', leido: true },
      { id: 'm2', from: 'bot', texto: 'Hola Carlos! Claro, déjame verificar disponibilidad para el jueves...', hora: '11:30', leido: true },
      { id: 'm3', from: 'paciente', texto: 'Y también quería saber si puedo pagar en efectivo', hora: '11:35', leido: true },
      { id: 'm4', from: 'admin', texto: 'Hola Carlos! Te atiende Valentina. Sí podés pagar en efectivo, sin problema. ¿El jueves a las 10 te viene bien?', hora: '11:40', leido: true },
      { id: 'm5', from: 'paciente', texto: 'Perfecto! ¿Me podés pasar los datos para la transferencia igualmente?', hora: '11:44', leido: false },
      { id: 'm6', from: 'admin', texto: 'Ok Carlos, te paso el CBU ahora', hora: '11:45', leido: true },
    ]
  },
  {
    id: 'c3', paciente_id: 'p3', modo: 'bot', ultimo_mensaje: 'Entendido Laura, tu turno queda cancelado. Escribinos para reagendar 😊', ultima_hora: '08:15', no_leidos: 0,
    mensajes: [
      { id: 'm1', from: 'paciente', texto: 'Hola, no voy a poder ir hoy a las 11', hora: '08:12', leido: true },
      { id: 'm2', from: 'bot', texto: 'Hola Laura, lamentamos que no puedas venir. ¿Querés cancelar el turno o reprogramarlo?', hora: '08:13', leido: true },
      { id: 'm3', from: 'paciente', texto: 'Cancelarlo por ahora', hora: '08:14', leido: true },
      { id: 'm4', from: 'bot', texto: 'Entendido Laura, tu turno queda cancelado. Escribinos para reagendar 😊', hora: '08:15', leido: true },
    ]
  },
  {
    id: 'c4', paciente_id: 'p4', modo: 'bot', ultimo_mensaje: 'La sesión de estética tiene un valor de $20.000. ¿Querés reservar con seña?', ultima_hora: 'Ayer', no_leidos: 0,
    mensajes: [
      { id: 'm1', from: 'paciente', texto: '¿Cuánto cuesta la sesión de estética?', hora: 'Ayer 16:30', leido: true },
      { id: 'm2', from: 'bot', texto: 'La sesión de estética tiene un valor de $20.000. ¿Querés reservar con seña?', hora: 'Ayer 16:31', leido: true },
    ]
  },
  {
    id: 'c5', paciente_id: 'p5', modo: 'bot', ultimo_mensaje: '¡Perfecto! Tu turno para el martes 29 a las 14:00 está confirmado ✅', ultima_hora: 'Ayer', no_leidos: 0,
    mensajes: [
      { id: 'm1', from: 'paciente', texto: 'Hola quiero sacar un turno de kinesiología', hora: 'Ayer 14:00', leido: true },
      { id: 'm2', from: 'bot', texto: 'Hola Ana! Tenemos disponibilidad el martes 29 a las 14:00 o el miércoles 30 a las 10:00 con el Dr. Sebastián Torres. ¿Cuál preferís?', hora: 'Ayer 14:01', leido: true },
      { id: 'm3', from: 'paciente', texto: 'El martes me viene bien', hora: 'Ayer 14:05', leido: true },
      { id: 'm4', from: 'bot', texto: '¡Perfecto! Tu turno para el martes 29 a las 14:00 está confirmado ✅', hora: 'Ayer 14:05', leido: true },
    ]
  },
]
