import { loadDocument } from "@/lib/loaders/pdf-loader";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const arrayBuffer = req.body;

      if (!arrayBuffer) {
        return res.status(400).json({ error: 'No file buffer provided' });
      }

      // Load the document using the provided buffer
      const document = await loadDocument(arrayBuffer);

      // Return the loaded document
      res.status(200).json({ document });
    } catch (error) {
      console.error('Error loading document:', error);
      res.status(500).json({ error: 'Failed to load document' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}