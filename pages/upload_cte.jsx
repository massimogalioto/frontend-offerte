import { useState } from 'react'

export default function UploadCte() {
  const [file, setFile] = useState(null)
  const [analisi, setAnalisi] = useState(null)
  const [errore, setErrore] = useState(null)
  const [caricamento, setCaricamento] = useState(false)
 
  const handleUpload = async () => {
    setErrore(null)
    setAnalisi(null)
    setCaricamento(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Step 1: upload e lettura testo
      const resUpload = await fetch('https://backend-offerte-production.up.railway.app/upload-cte', {
        method: 'POST',
        body: formData
      })
      const testoEstratto = await resUpload.json()

      // Step 2: analisi testo con AI
      const resAnalisi = await fetch('https://backend-offerte-production.up.railway.app/analizza-cte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mia_chiave_super_segreta_2024'
        },
        body: JSON.stringify({ testo: testoEstratto.contenuto_testo })
      })
      const risultato = await resAnalisi.json()

      setAnalisi(risultato)
    } catch (err) {
      setErrore('Errore durante l’analisi della CTE.')
    } finally {
      setCaricamento(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Upload Condizioni Tecnico Economiche</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!file || caricamento}
      >
        {caricamento ? 'Caricamento in corso...' : 'Analizza CTE'}
      </button>

      {errore && <p className="text-red-600 mt-4">{errore}</p>}

      {analisi && (
        <div className="mt-6 w-full max-w-3xl bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">📄 Dati estratti:</h2>
          <pre className="text-sm whitespace-pre-wrap break-all">{JSON.stringify(analisi, null, 2)}</pre>
        </div>
      )}
    </main>
  )
}
