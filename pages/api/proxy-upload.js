// src/pages/api/proxy-upload.js

export const config = {
  api: {
    bodyParser: false, // ⛔ disabilitiamo il body parser per gestire file
  },
};

import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: "File mancante o errore parsing" });
    }

    const fileData = fs.createReadStream(files.file.filepath);
    const formData = new FormData();
    formData.append("file", fileData, files.file.originalFilename);

    try {
      const uploadRes = await fetch("https://backend-offerte-production.up.railway.app/upload-bolletta", {
        method: "POST",
        headers: {
          "x-api-key": process.env.API_SECRET_KEY, // 👈 SEGRETA, sicura
          ...formData.getHeaders(),
        },
        body: formData,
      });

      const result = await uploadRes.json();
      res.status(uploadRes.status).json(result);
    } catch (error) {
      res.status(500).json({ error: "Errore nel proxy upload", dettaglio: error.message });
    }
  });
}
