import { useState } from 'react'
import { CloudUploadIcon } from '@heroicons/react/solid'

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
      const res = await fetch('https://backend-offerte-ocr-production.up.railway.app/upload-cte', {
        method: 'POST',
        headers: { 'x-api-key': 'mia_chiave_super_segreta_2024' },
        body: formData
      })

      const data = await res.json()
      if (!res.ok || data.errore) throw new Error(data.dettagli || data.errore || 'Errore durante l’analisi')
      setRisultato(data.output_ai || data)
    } catch (err) {
      setErrore(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSalva = async () => {
    if (!risultato || !fonteCte) return

    setSalvataggio(true)
    setErrore(null)
    setSuccesso(null)

    try {
      const res = await fetch('https://backend-offerte-ocr-production.up.railway.app/salva-offerta', {
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
      setSuccesso('✅ Offerta salvata in Airtable con successo!')
    } catch (err) {
      setErrore(err.message)
    } finally {
      setSalvataggio(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center">📎 Carica Condizioni Tecnico Economiche</h1>

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
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <CloudUploadIcon className="h-5 w-5" />
            {loading ? 'Analisi in corso...' : 'Analizza PDF'}
          </button>
        </form>

        {errore && <p className="mt-4 text-red-600 font-semibold">❌ {errore}</p>}
        {successo && <p className="mt-4 text-green-600 font-semibold">{successo}</p>}

        {risultato && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-center">📋 Dati estratti</h2>

            <ul className="bg-gray-50 p-4 rounded border text-sm space-y-1">
              {Object.entries(risultato).map(([key, value]) => (
                <li key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {value !== null ? value.toString() : '—'}</li>
              ))}
            </ul>

            <input
              type="text"
              value={fonteCte}
              onChange={e => setFonteCte(e.target.value)}
              placeholder="Fonte CTE (es. Acea Q2 2025)"
              className="w-full p-2 border rounded"
              required
            />

            <button
              onClick={handleSalva}
              disabled={salvataggio || !fonteCte}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              {salvataggio ? 'Salvataggio in corso...' : 'Salva in Airtable'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
