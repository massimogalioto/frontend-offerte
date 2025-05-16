import { useState } from 'react'

export default function UploadCTE() {
  const [file, setFile] = useState(null)
  const [risultato, setRisultato] = useState(null)
  const [fonteCte, setFonteCte] = useState('')
  const [errore, setErrore] = useState(null)
  const [successo, setSuccesso] = useState(null)
  const [loading, setLoading] = useState(false)
  const [salvataggio, setSalvataggio] = useState(false)

  const handleUpload = async e => {
    e.preventDefault()
    if (!file) return

    setErrore(null)
    setSuccesso(null)
    setRisultato(null)
    setFonteCte('')
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('https://backend-offerte-production.up.railway.app/upload-cte', {
        method: 'POST',
        headers: {
          'x-api-key': 'mia_chiave_super_segreta_2024'
        },
        body: formData
      })

      const data = await res.json()
      if (!res.ok || data.errore) throw new Error(data.dettagli || data.errore || 'Errore durante analisi CTE')
      setRisultato(data.output_ai || data)
    } catch (err) {
      setErrore(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSalva = async () => {
    if (!risultato) return

    setSalvataggio(true)
    setErrore(null)
    setSuccesso(null)

    try {
      const res = await fetch('https://backend-offerte-production.up.railway.app/salva-offerta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mia_chiave_super_segreta_2024'
        },
        body: JSON.stringify({
          ...risultato,
          fonte_cte: fonteCte
        })
      })

      const data = await res.json()
      if (!res.ok || data.errore) throw new Error(data.errore || 'Errore nel salvataggio')
      setSuccesso('✅ Offerta salvata in Airtable con successo.')
    } catch (err) {
      setErrore(err.message)
    } finally {
      setSalvataggio(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4">📎 Carica CTE Fornitore</h1>
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
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {loading ? 'Analisi in corso...' : 'Analizza PDF'}
          </button>
        </form>

        {errore && <p className="mt-4 text-red-600 font-semibold">❌ {errore}</p>}
        {successo && <p className="mt-4 text-green-600 font-semibold">{successo}</p>}

        {risultato && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">📋 Dati estratti:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(risultato, null, 2)}
            </pre>

            <input
              type="text"
              placeholder="Fonte CTE (es. Acea Q2 2025)"
              value={fonteCte}
              onChange={e => setFonteCte(e.target.value)}
              className="p-2 border rounded w-full"
              required
            />

            <button
              onClick={handleSalva}
              disabled={salvataggio || !fonteCte}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              {salvataggio ? 'Salvataggio...' : 'Salva in Airtable'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
