import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminOfferte() {
  const router = useRouter()
  const [autorizzato, setAutorizzato] = useState(false)
  const [form, setForm] = useState({
    kwh_totali: '',
    mesi_bolletta: '',
    spesa_materia_energia: '',
    tipo_fornitura: 'Luce',
    data_riferimento: ''
  })
  const [risultato, setRisultato] = useState(null)
  const [errore, setErrore] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = router.query.token
    if (token === 'ufficio123') {
      setAutorizzato(true)
    }
  }, [router.query])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setErrore(null)
    setRisultato(null)
    setLoading(true)

    try {
      const res = await fetch('https://backend-offerte-production.up.railway.app/confronta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mia_chiave_super_segreta_2024'
        },
        body: JSON.stringify({
          ...form,
          kwh_totali: parseFloat(form.kwh_totali),
          mesi_bolletta: parseInt(form.mesi_bolletta),
          spesa_materia_energia: parseFloat(form.spesa_materia_energia)
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Errore durante la richiesta')
      }

      const data = await res.json()
      setRisultato(data)
    } catch (err) {
      setErrore(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!autorizzato) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-red-600 font-semibold">🔒 Accesso riservato.<br /> Aggiungi <code>?token=ufficio123</code> all’URL per accedere.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gray-100 py-10 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Simulatore Offerte (Modalità Interna)</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input name="kwh_totali" type="number" step="any" placeholder="kWh totali" onChange={handleChange} className="p-2 border rounded" required />
          <input name="mesi_bolletta" type="number" placeholder="Mesi bolletta" onChange={handleChange} className="p-2 border rounded" required />
          <input name="spesa_materia_energia" type="number" step="any" placeholder="Spesa materia energia \u20AC" onChange={handleChange} className="p-2 border rounded" required />
          <select name="tipo_fornitura" onChange={handleChange} className="p-2 border rounded">
            <option value="Luce">Luce</option>
            <option value="Gas">Gas</option>
          </select>
          <input name="data_riferimento" type="date" onChange={handleChange} className="p-2 border rounded" required />
          <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded">
            {loading ? 'Attendi...' : 'Visualizza Offerte'}
          </button>
        </form>

        {errore && <p className="text-red-600 mt-4">❌ {errore}</p>}

        {risultato && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Tutte le offerte (dettaglio completo):</h2>
            <ul className="space-y-3">
              {risultato.offerte.map((offerta, index) => (
                <li key={index} className="bg-gray-50 p-4 rounded border">
                  <p><strong>ID offerta:</strong> {offerta.id}</p>
                  <p><strong>Fornitore:</strong> {offerta.fornitore}</p>
                  <p><strong>Nome offerta:</strong> {offerta.nome_offerta || 'N/A'}</p>
                  <p><strong>Tariffa:</strong> {offerta.tariffa}</p>
                  <p><strong>Prezzo kWh:</strong> {'\u20AC'}{offerta.prezzo_kwh}</p>
                  <p><strong>Costo fisso:</strong> {'\u20AC'}{offerta.costo_fisso}</p>
                  <p><strong>Totale simulato:</strong> {'\u20AC'}{offerta.totale_simulato}</p>
                  <p><strong>Prezzo effettivo pagato:</strong> {'\u20AC'}{offerta.prezzo_effettivo_pagato}</p>
                  <p><strong>Differenza mensile:</strong> {offerta.tipo_differenza} di {'\u20AC'}{offerta.differenza_euro_mese} ({offerta.percentuale}%)</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
