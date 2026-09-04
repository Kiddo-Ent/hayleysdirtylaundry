import { NextResponse } from 'next/server'

const required = ['name', 'email', 'phone', 'service', 'address', 'details'] as const

export async function POST(request: Request) {
  const body = await request.json()
  if (!required.every((field) => typeof body[field] === 'string' && body[field].trim())) return NextResponse.json({ error: 'Please complete all fields.' }, { status: 400 })

  const apiKey = process.env.RESEND_API_KEY
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL
  const from = process.env.ORDER_FROM_EMAIL
  if (!apiKey || !recipient || !from) return NextResponse.json({ error: 'Email is not configured yet.' }, { status: 503 })

  const text = `New laundry request\n\nName: ${body.name}\nEmail: ${body.email}\nMobile: ${body.phone}\nService: ${body.service}\nPickup address: ${body.address}\n\nPickup notes:\n${body.details}`
  const email = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [recipient], reply_to: body.email, subject: `New laundry request — ${body.name}`, text }) })
  if (!email.ok) return NextResponse.json({ error: 'Email could not be sent.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
