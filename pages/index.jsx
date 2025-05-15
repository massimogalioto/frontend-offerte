import { useState } from 'react'

export default function SimulatoreOfferte() {
  const [form, setForm] = useState({
    kwh_totali: '',
    periodo_bolletta: '',
    spesa_materia_energia: '',
    tipo_fornitura: 'Luce',
    tipologia_cliente: 'Residenziale',
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
      // 1️⃣ Chiamata a /calcola-mesi
      const mesiRes = await fetch('https://backend-offerte-production.up.railway.app/calcola-mesi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mia_chiave_super_segreta_2024'
        },
        body: JSON.stringify({ periodo: form.periodo_bolletta })
      })
      const mesiData = await mesiRes.json()
      if (!mesiRes.ok || !mesiData.mesi) throw new Error('Errore nel calcolo mesi')

      // 2️⃣ Chiamata a /confronta
      const res = await fetch('https://backend-offerte-production.up.railway.app/confronta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mia_chiave_super_segreta_2024'
        },
        body: JSON.stringify({
          kwh_totali: parseFloat(form.kwh_totali),
          mesi_bolletta: mesiData.mesi,
          spesa_materia_energia: parseFloat(form.spesa_materia_energia),
          tipo_fornitura: form.tipo_fornitura,
          tipologia_cliente: form.tipologia_cliente,
          data_riferimento: form.data_riferimento
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Errore nel confronto')
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
        <h1 className="text-2xl font-bold mb-4">Simulatore Offerte Luce & Gas</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input name="kwh_totali" type="number" step="any" placeholder="kWh totali" onChange={handleChange} className="p-2 border rounded" required />
          <input name="periodo_bolletta" type="text" placeholder="Periodo (es. 'GEN-MAR 2025')" onChange={handleChange} className="p-2 border rounded" required />
          <input name="spesa_materia_energia" type="number" step="any" placeholder="Spesa materia energia (€)" onChange={handleChange} className="p-2 border rounded" required />
          <select name="tipo_fornitura" onChange={handleChange} className="p-2 border rounded">
            <option value="Luce">Luce</option>
            <option value="Gas">Gas</option>
          </select>
          <select name="tipologia_cliente" onChange={handleChange} className="p-2 border rounded">
            <option value="Residenziale">Residenziale</option>
            <option value="Business">Business</option>
          </select>
          <input name="data_riferimento" type="date" onChange={handleChange} className="p-2 border rounded" required />
          <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded">
            {loading ? 'Attendi...' : 'Visualizza Offerte'}
          </button>
        </form>

        {errore && <p className="text-red-600 mt-4">❌ {errore}</p>}

        {risultato && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Risultato simulazione:</h2>
            <ul className="space-y-4">
              {risultato.offerte.map((offerta, index) => (
                <li key={index} className="bg-gray-50 p-4 rounded border text-sm">
                  <p><strong>Fornitore:</strong> {offerta.fornitore}</p>
                  <p><strong>Offerta:</strong> {offerta.nome_offerta}</p>
                  <p><strong>Tariffa:</strong> {offerta.tariffa}</p>
                  <p><strong>Prezzo €/kWh:</strong> {offerta.prezzo_kwh ?? '—'}</p>
                  <p><strong>Spread €/kWh:</strong> {offerta.spread ?? '—'}</p>
                  <p><strong>Costo fisso mensile:</strong> €{offerta.costo_fisso}</p>
                  <p><strong>Totale simulato:</strong> €{offerta.totale_simulato}</p>
                  <p><strong>Rispetto alla tua bolletta:</strong> {offerta.tipo_differenza} di €{offerta.differenza_€_mese} ({offerta.percentuale}%)</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
