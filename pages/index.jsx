import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState(null)
  const [risultato, setRisultato] = useState(null)
  const [errore, setErrore] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async e => {
    e.preventDefault()
    if (!file) return

    setErrore(null)
    setRisultato(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('https://backend-offerte-production.up.railway.app/upload-bolletta', {
        method: 'POST',
        headers: {
          'x-api-key': 'mia_chiave_super_segreta_2024'
        },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Errore durante la richiesta')
      setRisultato(data)
    } catch (err) {
      setErrore(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col items-center">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4">📄 Carica la tua bolletta</h1>
        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={e => setFile(e.target.files[0])}
            className="block w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            {loading ? 'Analisi in corso...' : 'Analizza Bolletta'}
          </button>
        </form>

        {errore && <p className="mt-4 text-red-600 font-semibold">❌ {errore}</p>}

        {risultato && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">💡 Dati estratti:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(risultato.bolletta, null, 2)}
            </pre>

            <h2 className="text-xl font-semibold">📈 Offerte simulate:</h2>
            <ul className="space-y-3">
              {risultato.offerte.map((offerta, idx) => (
                <li key={idx} className="bg-white p-4 border rounded shadow-sm">
                  <p><strong>Fornitore:</strong> {offerta.fornitore}</p>
                  <p><strong>Nome offerta:</strong> {offerta.nome_offerta}</p>
                  <p><strong>Tariffa:</strong> {offerta.tariffa}</p>
                  <p><strong>Prezzo kWh:</strong> {'€'}{offerta.prezzo_kwh}</p>
                  <p><strong>Costo fisso:</strong> {'€'}{offerta.costo_fisso}</p>
                  <p><strong>Totale simulato:</strong> {'€'}{offerta.totale_simulato}</p>
                  <p><strong>Rispetto attuale:</strong> {offerta.tipo_differenza} di {'€'}{offerta.differenza_mensile} ({offerta.percentuale}%)</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
