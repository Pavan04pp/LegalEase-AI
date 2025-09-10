const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const aiService = require('../ai-service/aiClient.js');
// Use built-in fetch in Node 18+
const fetch = globalThis.fetch || require('node-fetch');

const app = express();
const port = process.env.PORT || 5000;

// In-memory storage for documents (replace with database in production)
const documents = {};

// Helpers
function extractRegistrationNumber(text) {
  if (!text || typeof text !== 'string') return null;
  const candidates = [];
  // Common patterns: REG NO: ABC-1234, Registration No. 2021/ABC/987, Doc No: 123-456-789
  const patterns = [
    /(reg(?:istration)?\s*(?:no\.?|number)\s*[:#-]?\s*([A-Z0-9\-\/]{4,}))/i,
    /(document\s*(?:no\.?|number)\s*[:#-]?\s*([A-Z0-9\-\/]{4,}))/i,
    /(doc\s*(?:no\.?|number)\s*[:#-]?\s*([A-Z0-9\-\/]{4,}))/i,
    /\b([A-Z]{2,}[-\/]?\d{3,}[-\/]?\d{2,})\b/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const full = match[0];
      const value = match[2] || match[1];
      candidates.push((value || full).toString().trim());
    }
  }
  return candidates.length > 0 ? candidates[0] : null;
}

async function ocrWithOCRSpace(filePath) {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    console.log('OCR_SPACE_API_KEY not set; skipping OCR.');
    return '';
  }
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');
    const resp = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        apikey: apiKey,
        base64Image: `data:application/pdf;base64,${base64}`,
        isOverlayRequired: 'false',
        OCREngine: '2',
        filetype: 'PDF'
      })
    });
    if (!resp.ok) {
      console.error('OCR.space HTTP error:', resp.status, resp.statusText);
      return '';
    }
    const data = await resp.json();
    const parsed = data?.ParsedResults?.map(r => r?.ParsedText || '').join('\n') || '';
    console.log('OCR.space extracted length:', parsed.length);
    return parsed;
  } catch (e) {
    console.error('OCR.space error:', e);
    return '';
  }
}

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'text/txt'];
    console.log('File type:', file.mimetype, 'File name:', file.originalname);
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.pdf') || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed. Received: ' + file.mimetype));
    }
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test upload endpoint
app.post('/api/test-upload', (req, res) => {
  console.log('Test upload endpoint hit');
  res.json({ message: 'Test upload endpoint working' });
});

app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    console.log('Upload request received:', req.body, req.file);
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded. Please select a PDF or TXT file.' });
    }

    const filePath = req.file.path;
    let extractedText = '';

    // Extract text based on file type
    console.log('File type:', req.file.mimetype);
    console.log('File path:', filePath);
    
    if (req.file.mimetype === 'application/pdf') {
      console.log('Processing PDF file...');
      try {
        const dataBuffer = fs.readFileSync(filePath);
        console.log('PDF buffer size:', dataBuffer.length);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
        console.log('Extracted text length:', extractedText.length);
        console.log('Extracted text preview:', extractedText.substring(0, 200));
        
        if (!extractedText || extractedText.trim().length === 0) {
          console.log('WARNING: No text extracted from PDF');
          // OCR fallback
          const ocrText = await ocrWithOCRSpace(filePath);
          if (ocrText && ocrText.trim().length > 0) {
            extractedText = ocrText;
            console.log('Used OCR fallback. New text length:', extractedText.length);
          } else {
            extractedText = 'PDF file processed but no readable text found. This may be a scanned image PDF.';
          }
        }
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        // Try OCR on parse error
        const ocrText = await ocrWithOCRSpace(filePath);
        if (ocrText && ocrText.trim().length > 0) {
          extractedText = ocrText;
          console.log('Used OCR after parse error. Text length:', extractedText.length);
        } else {
          extractedText = 'Error extracting text from PDF: ' + pdfError.message;
        }
      }
    } else if (req.file.mimetype === 'text/plain') {
      console.log('Processing TXT file...');
      extractedText = fs.readFileSync(filePath, 'utf8');
      console.log('Text file length:', extractedText.length);
    }

    // Generate document ID
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store document text
    documents[docId] = extractedText;

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Extract registration number (best-effort)
    const registrationNumber = extractRegistrationNumber(extractedText);

    // Return response
    const textPreview = extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : '');
    
    res.json({
      docId,
      textPreview,
      wordCount: extractedText.split(/\s+/).length,
      registrationNumber
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process document',
      message: error.message 
    });
  }
});

// Simple Q&A over a stored document (keyword-based)
app.post('/api/ask', async (req, res) => {
  try {
    const { docId, question } = req.body;
    if (!docId || !question) {
      return res.status(400).json({ error: 'docId and question are required' });
    }
    const text = documents[docId];
    if (!text) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const result = await aiService.answerQuestion(question, text);
    res.json(result);
  } catch (e) {
    console.error('Ask error:', e);
    res.status(500).json({ error: 'Failed to answer question', message: e.message });
  }
});

// Simplify (Layman Mode)
app.post('/api/simplify', (req, res) => {
  try {
    const { docId, text } = req.body || {};
    let content = text;
    if (!content && docId) content = documents[docId];
    if (!content) return res.status(400).json({ error: 'Provide docId or text' });
    const simplified = aiService.simplifyJargon(content);
    res.json({ simplified });
  } catch (e) {
    console.error('Simplify error:', e);
    res.status(500).json({ error: 'Failed to simplify', message: e.message });
  }
});

// Mock e-sign initiation
app.post('/api/esign/initiate', (req, res) => {
  const { docId, signerName, signerEmail } = req.body || {};
  if (!docId || !signerName || !signerEmail) {
    return res.status(400).json({ error: 'docId, signerName, signerEmail are required' });
  }
  const token = Math.random().toString(36).slice(2);
  const signUrl = `https://example.com/esign?doc=${encodeURIComponent(docId)}&token=${token}`;
  res.json({ signUrl, token, expiresInMinutes: 30 });
});

app.post('/api/summarize', async (req, res) => {
  try {
    const { docId, text } = req.body;
    
    let documentText;
    
    if (docId) {
      documentText = documents[docId];
      if (!documentText) {
        return res.status(404).json({ error: 'Document not found' });
      }
    } else if (text) {
      documentText = text;
    } else {
      return res.status(400).json({ error: 'Either docId or text must be provided' });
    }

    // Call AI service
    console.log('Calling AI service with text length:', documentText.length);
    const result = await aiService.summarizeDocument(documentText);
    console.log('AI service result:', result);
    
    res.json(result);

  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ 
      error: 'Failed to summarize document',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`LegalEase Backend running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
