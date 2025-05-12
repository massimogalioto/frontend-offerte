import { useState } from 'react'

export default function ConfrontaBolletta() {
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Confronta la tua Bolletta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="kwh_totali" type="number" step="any" placeholder="kWh totali" onChange={handleChange} className="w-full p-2 border rounded" required />
          <input name="mesi_bolletta" type="number" placeholder="Mesi della bolletta" onChange={handleChange} className="w-full p-2 border rounded" required />
          <input name="spesa_materia_energia" type="number" step="any" placeholder="Spesa materia energia €" onChange={handleChange} className="w-full p-2 border rounded" required />
          <select name="tipo_fornitura" onChange={handleChange} className="w-full p-2 border rounded">
            <option value="Luce">Luce</option>
            <option value="Gas">Gas</option>
          </select>
          <input name="data_riferimento" type="date" onChange={handleChange} className="w-full p-2 border rounded" required />
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded w-full">
            {loading ? 'Attendi...' : 'Confronta'}
          </button>
        </form>

        {errore && <p className="text-red-600 mt-4">❌ {errore}</p>}

        {risultato && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Offerte trovate:</h2>
            <ul className="space-y-2">
              {risultato.offerte.map((offerta, index) => (
                <li key={index} className="p-3 bg-gray-100 rounded">
                  <p className="font-bold">ID offerta: {offerta.id}</p>
                  <p className="text-sm">Totale stimato: €{offerta.totale_simulato}</p>
                  <p className="text-sm">Differenza rispetto alla bolletta: {offerta.tipo_differenza} di €{offerta.differenza_€_mese} ({offerta.percentuale}%)</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
