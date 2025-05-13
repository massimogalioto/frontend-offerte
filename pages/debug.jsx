import { useState } from 'react'

export default function DebugOfferte() {
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
    <main className="min-h-screen flex flex-col items-center justify-start bg-gray-100 py-10 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Debug Offerte - Verifica Calcoli</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input name="kwh_totali" type="number" step="any" placeholder="kWh totali" onChange={handleChange} className="p-2 border rounded" required />
          <input name="mesi_bolletta" type="number" placeholder="Mesi bolletta" onChange={handleChange} className="p-2 border rounded" required />
          <input name="spesa_materia_energia" type="number" step="any" placeholder="Spesa materia energia €" onChange={handleChange} className="p-2 border rounded" required />
          <select name="tipo_fornitura" onChange={handleChange} className="p-2 border rounded">
            <option value="Luce">Luce</option>
            <option value="Gas">Gas</option>
          </select>
          <input name="data_riferimento" type="date" onChange={handleChange} className="p-2 border rounded" required />
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
            {loading ? 'Attendi...' : 'Invia e verifica'}
          </button>
        </form>

        {errore && <p className="text-red-600 mt-4">❌ {errore}</p>}

        {risultato && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Dati di debug:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(risultato, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  )
}
