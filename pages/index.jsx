import { useState } from 'react'

export default function Home() {
  const [form, setForm] = useState({
    kwh_totali: '',
    mesi_bolletta: '',
    spesa_materia_energia: '',
    tipo_fornitura: 'Luce',
    data_riferimento: ''
  })
  const [risultato, setRisultato] = useState(null)
  const [errore, setErrore] = useState(null)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setErrore(null)
    setRisultato(null)

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
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="max-w-lg w-full bg-white rounded shadow p-6 mt-10">
        <h1 className="text-xl font-bold mb-4">Carica la tua bolletta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="kwh_totali" type="number" step="any" onChange={handleChange} placeholder="kWh totali" className="w-full p-2 border rounded" required />
          <input name="mesi_bolletta" type="number" onChange={handleChange} placeholder="Mesi bolletta" className="w-full p-2 border rounded" required />
          <input name="spesa_materia_energia" type="number" step="any" onChange={handleChange} placeholder="Spesa materia energia (€)" className="w-full p-2 border rounded" required />
          <select name="tipo_fornitura" onChange={handleChange} className="w-full p-2 border rounded">
            <option value="Luce">Luce</option>
            <option value="Gas">Gas</option>
          </select>
          <input name="data_riferimento" type="date" onChange={handleChange} className="w-full p-2 border rounded" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Confronta Offerte</button>
        </form>

        {errore && <p className="text-red-600 mt-4">❌ {errore}</p>}

        {risultato && (
          <div className="mt-6">
            <h2 className="font-bold text-lg">Risultati:</h2>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(risultato, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  )
}
