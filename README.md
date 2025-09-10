# LegalEase AI

An AI-powered legal document analysis tool built with React, Node.js, and free AI APIs.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Hugging Face API key (free) - optional

### Setup

1. **Clone and setup environment**
```bash
git clone <repository>
cd legalease-ai
cp .env.example .env
# Edit .env and add your CLAUDE_API_KEY
```

2. **Install and run frontend**
```bash
cd frontend
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

3. **Install and run backend (in new terminal)**
```bash
cd backend
npm install
npm run dev
# Backend will run on http://localhost:5000
```

### Testing the Full Flow
1. Open http://localhost:5173
2. Click "Test Tailwind Button" to verify styling works
3. Upload a PDF or TXT legal document
4. Click "Analyze Document" to get AI summary and risk analysis

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/upload` - Upload document (PDF/TXT)
- `POST /api/summarize` - Get AI analysis of document

## Project Structure
- `/frontend`          # React + Vite + TypeScript + Tailwind
- `/backend`           # Express.js API server
- `/ai-service`        # Claude AI integration
- `/docs`              # Sample documents (add your PDFs here)

## Troubleshooting

### Tailwind not working?
- Restart frontend dev server
- Check postcss.config.cjs uses CommonJS syntax

### CORS errors?
- Verify backend is running on port 5000
- Check browser developer console for errors

### AI not working?
- Add valid CLAUDE_API_KEY to .env file
- Check API key permissions and rate limits
- App will show mock responses if API fails

### Upload failing?
- Verify backend is running
- Check file size (max 10MB)
- Try smaller PDF files first

## Sample Test Files
Add sample legal documents to `/docs/` folder for testing. Recommended:
- Simple contract PDF
- Terms of service TXT file
- Privacy policy document

## Run & Test Checklist

### Installation Commands
```bash
# Frontend setup
cd frontend
npm install
npm run dev    # Runs on http://localhost:5173

# Backend setup
cd backend
npm install
npm run dev    # Runs on http://localhost:5000

# AI Service setup (optional - already included in backend)
cd ai-service
npm install
node test.js   # Test AI service independently
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add (optional):
HUGGINGFACE_API_KEY=hf_your_free_token_here
PORT=5000
```

### Test cURL Commands

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Upload Test (with sample text file):**
```bash
# Create test file first
echo "This is a sample legal contract between Party A and Party B. Party A agrees to provide services. Party B agrees to pay $1000. Either party may terminate with 30 days notice." > test-contract.txt

# Upload via cURL
curl -X POST \
  -F "document=@test-contract.txt" \
  http://localhost:5000/api/upload
```

**Summarize Test:**
```bash
# Use docId from upload response
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"docId":"doc_1234567890_abcdefg"}' \
  http://localhost:5000/api/summarize

# Or test with direct text
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a legal agreement between Company A and Company B for consulting services worth $50,000 over 6 months."}' \
  http://localhost:5000/api/summarize
```

### Verification Steps

**Frontend UI Test:**
1. Visit http://localhost:5173
2. Verify "Test Tailwind Button" shows brand colors (#63ACC2 blue)
3. Upload interface should be styled with dashed border

**Upload Flow Test:**
1. Create a simple text file or use a PDF
2. Upload through UI
3. Check browser Network tab for successful POST to /api/upload
4. Verify document ID and text preview appear

**AI Analysis Test:**
1. Click "Analyze Document" after upload
2. Check Network tab for POST to /api/summarize
3. Verify JSON response with summary and risks fields
4. UI should display summary and risk list

**Backend API Test:**
1. All cURL commands above should return valid JSON
2. Health endpoint should show {"status": "ok"}

## Troubleshooting

### Common Errors and Fixes

**"Tailwind utilities not applying"**
```bash
# Fix: Check PostCSS config and restart
cd frontend
# Verify postcss.config.cjs uses module.exports (CommonJS)
npm run dev  # Restart dev server
```

**"Access to fetch at 'http://localhost:5000' blocked by CORS"**
```bash
# Fix: Verify CORS configuration
cd backend
# Check index.js has: origin: 'http://localhost:5173'
# Restart backend: npm run dev
```

**"Network Error / Upload failed"**
```bash
# Fix: Check backend is running
curl http://localhost:5000/api/health
# Should return: {"status":"ok","timestamp":"..."}
# If not working, check backend terminal for errors
```

**"AI service not working / Mock responses only"**
```bash
# Fix: Add valid API key
# Edit .env file:
CLAUDE_API_KEY=sk-ant-api03-your-actual-key-here

# Test AI service directly:
cd ai-service
node test.js
# Should show actual AI response, not mock
```

**"pdf-parse module error"**
```bash
# Fix: Reinstall dependencies
cd backend
rm -rf node_modules
npm install
# If still failing, test with TXT files first
```

**"File upload size error"**
```bash
# Fix: Check file size (max 10MB) or adjust limit
# In backend/index.js, modify multer config:
limits: { fileSize: 20 * 1024 * 1024 } // 20MB
```

**"Vite build/dev errors"**
```bash
# Fix: Clear cache and reinstall
cd frontend
rm -rf node_modules dist .vite
npm install
npm run dev
```

**"Cannot find module errors"**
```bash
# Fix: Ensure all dependencies installed
cd frontend && npm install
cd ../backend && npm install
cd ../ai-service && npm install
```

## Development Notes
- **API Key Safety**: Never commit .env file. Use .env.example for sharing
- **File Storage**: Backend uses in-memory storage. Replace with database for production
- **Error Handling**: AI service falls back to mock responses if API fails
- **Tailwind v4**: Uses PostCSS plugin, not traditional config file
- **CORS**: Currently allows localhost:5173 only. Update for production domains
- **File Types**: Supports PDF and TXT. Add more types by updating multer filter

## Production Checklist
- [ ] Replace in-memory storage with database
- [ ] Add authentication/authorization
- [ ] Configure production CORS origins
- [ ] Add rate limiting
- [ ] Set up proper logging
- [ ] Configure environment-specific builds
- [ ] Add input validation and sanitization
- [ ] Set up monitoring and health checks