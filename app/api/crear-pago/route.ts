import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { especialidad, profesional, horario, monto } = await req.json()

  const accessToken = process.env.MP_TEST_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ error: 'MP_TEST_ACCESS_TOKEN no configurado' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://policonsultorio-prototipo.vercel.app'

  const preference = {
    items: [{
      title: `Seña - ${especialidad} con ${profesional}`,
      description: `Turno: ${horario}`,
      quantity: 1,
      unit_price: monto,
      currency_id: 'ARS',
    }],
    external_reference: `demo-${Date.now()}`,
    notification_url: 'https://leacouretot.app.n8n.cloud/webhook/mp-pago-confirmado',
    back_urls: {
      success: `${appUrl}/demo?pago=aprobado`,
      failure: `${appUrl}/demo?pago=error`,
      pending: `${appUrl}/demo?pago=pendiente`,
    },
    auto_return: 'approved',
    statement_descriptor: 'Policonsultorio Ciudad Jardin',
  }

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preference),
  })

  if (!response.ok) {
    const error = await response.json()
    return NextResponse.json({ error }, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json({ url: data.init_point, sandbox_url: data.sandbox_init_point })
}
