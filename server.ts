import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeTranscript } from './src/server/analyzeService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasTypesafe: !!process.env.TYPESAFE_API_KEY });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      res.status(400).json({ error: 'transcript is required' });
      return;
    }
    const result = await analyzeTranscript(transcript);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal analysis error' });
  }
});

// Static assets
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Dual-Spectrum Phishing Guardian listening on http://0.0.0.0:${port}`);
});
