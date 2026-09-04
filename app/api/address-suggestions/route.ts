import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let input = ''
  try { input = String((await request.json()).input || '').trim() } catch { return NextResponse.json({ suggestions: [] }, { status: 400 }) }
  if (input.length < 3 || input.length > 200) return NextResponse.json({ suggestions: [] })

  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return NextResponse.json({ suggestions: [], message: 'Address suggestions are not configured yet.' }, { status: 503 })
  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
    body: JSON.stringify({ input, includedRegionCodes: ['au'], regionCode: 'au', languageCode: 'en' }), cache: 'no-store',
  })
  if (!response.ok) return NextResponse.json({ suggestions: [] }, { status: 502 })
  const payload = await response.json()
  const suggestions = (payload.suggestions || []).flatMap((item: { placePrediction?: { placeId?: string; text?: { text?: string } } }) => {
    const prediction = item.placePrediction
    return prediction?.placeId && prediction.text?.text ? [{ placeId: prediction.placeId, text: prediction.text.text }] : []
  })
  return NextResponse.json({ suggestions })
}
