'use client'

import { FormEvent, useEffect, useState } from 'react'

const services = [
  ['Pickup & delivery', 'We collect from your door (Free within 10kms of Inverloch) and bring every load back to you.'],
  ['Wash, dry & fold', 'All your dirty laundry, fresh, folded and ready to put away.'],
  ['Load Splitting', 'Darks, Lights, Whites and Towels washed in separate loads.'],
]

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [address, setAddress] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{ placeId: string; text: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const query = address.trim()
    if (query.length < 3) { setSuggestions([]); setIsSearching(false); return }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch('/api/address-suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: query }), signal: controller.signal })
        const result = await response.json()
        setSuggestions(response.ok ? result.suggestions || [] : [])
      } catch (error) { if ((error as Error).name !== 'AbortError') setSuggestions([]) } finally { setIsSearching(false) }
    }, 250)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [address])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setStatus('sending')
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!response.ok) throw new Error('Request failed')
      setStatus('sent')
      event.currentTarget.reset()
    } catch {
      setStatus('error')
    }
  }

  return <main>
    <nav className="nav"><a href="#top" className="brand" aria-label="Hayley’s Dirty Laundry home"><img src="/hayleys-dirty-laundry-logo.png" alt="Hayley’s Dirty Laundry" /></a><div className="nav-links"><a href="#services">Services</a><a href="#how">How it works</a><a className="nav-button" href="#request">Request a pickup</a></div></nav>
    <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow">PICK UP · WASH · DRY · FOLD · DELIVER</p><p className="script-kicker">We’ll do the dirty work!</p><h1>Fresh laundry,<br/><em>more you time.</em></h1><p className="lead">Warm, reliable laundry care collected from your door and returned beautifully clean and folded.</p><a className="primary" href="#request">Request a pickup <span>♥</span></a><p className="small-note">LOCAL CARE · PICKED UP & DELIVERED WITH LOVE</p></div><div className="hero-art hero-logo"><img src="/hayleys-dirty-laundry-logo.png" alt="Hayley’s Dirty Laundry — picked up and delivered with care" /></div></section>
    <section id="services" className="services"><p className="eyebrow">WHAT WE TAKE CARE OF</p><h2>Clean clothes. Clear head.</h2><div className="service-grid">{services.map(([name, description], index) => <article className="service-card" key={name}><span className="number">0{index + 1}</span><h3>{name}</h3><p>{description}</p></article>)}</div></section>
    <section id="how" className="steps"><div><p className="eyebrow">SIMPLE AS SUNDAY</p><p className="script-kicker">Laundry off your list</p><h2>From your door<br/>back to yours.</h2></div><ol><li><span>01</span><div><h3>Send a request</h3><p>Tell us what needs doing and when works for you.</p></div></li><li><span>02</span><div><h3>We collect</h3><p>Your laundry is picked up from your doorstep.</p></div></li><li><span>03</span><div><h3>Wash, dry & fold</h3><p>Every load is carefully cleaned and neatly folded.</p></div></li><li><span>04</span><div><h3>Fresh return</h3><p>We bring it back clean and ready to enjoy.</p></div></li></ol></section>
    <section id="request" className="request"><div className="request-heading"><p className="eyebrow">READY WHEN YOU ARE</p><p className="script-kicker">Let’s get this sorted</p><h2>Laundry off<br/><em>your list.</em></h2><p>Send a request and Hayley will be in touch to confirm your collection.</p><div className="contact-detail">Prefer a chat? <a href="tel:+61000000000">Call Hayley</a></div></div><form onSubmit={submit}><label>Name<input required name="name" placeholder="Your name" /></label><label>Email<input required type="email" name="email" placeholder="you@email.com" /></label><label>Mobile<input required name="phone" placeholder="Your best number" /></label><label>Service<select name="service" defaultValue="Wash, dry & fold"><option>Wash, dry & fold</option><option>Pickup & delivery</option><option>Bedding & towels</option><option>Something else</option></select></label><label className="wide address-field">Pickup address<div className="address-input-wrap"><input required name="address" autoComplete="street-address" value={address} placeholder="Start typing your street address" onChange={(event) => { setAddress(event.target.value); setShowSuggestions(true) }} onFocus={() => setShowSuggestions(true)} />{isSearching && <span className="address-loading">Searching…</span>}{showSuggestions && suggestions.length > 0 && <div className="address-suggestions" role="listbox">{suggestions.map((suggestion) => <button type="button" role="option" key={suggestion.placeId} onMouseDown={(event) => { event.preventDefault(); setAddress(suggestion.text); setSuggestions([]); setShowSuggestions(false) }}>{suggestion.text}</button>)}<p>Powered by Google</p></div>}</div></label><label className="wide">Pickup notes<textarea required name="details" rows={3} placeholder="Preferred day, access instructions, and anything Hayley should know…" /></label><button className="primary" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send request'} <span>♥</span></button>{status === 'sent' && <p className="form-message success">Thanks! Hayley has your request and will be in touch soon.</p>}{status === 'error' && <p className="form-message error">Something went wrong. Please try again or call Hayley directly.</p>}</form></section>
    <footer><a className="brand" href="#top" aria-label="Hayley’s Dirty Laundry home"><img src="/hayleys-dirty-laundry-logo.png" alt="Hayley’s Dirty Laundry" /></a><p>Fresh laundry. More life.</p><p>© {new Date().getFullYear()} Hayley’s Dirty Laundry</p></footer>
  </main>
}
