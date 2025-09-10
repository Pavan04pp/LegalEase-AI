import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import Button from './components/Button';

interface UploadResponse {
  docId: string;
  textPreview: string;
  registrationNumber?: string | null;
}

interface SummaryResponse {
  summary: string;
  risks: string[];
  contractType: string;
  keyTerms: string[];
  complianceIssues: string[];
  recommendations: string[];
  confidenceScore: number;
  documentStats: {
    wordCount: number;
    pageCount: number;
    complexity: string;
  };
}

function App() {
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [simplified, setSimplified] = useState<string | null>(null);
  type Message = { role: 'user' | 'assistant'; content: string };
  const [messages, setMessages] = useState<Message[]>([]);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    
    console.log('Uploading file:', file.name, file.type, file.size);
    
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error response:', errorData);
        throw new Error(errorData.error || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      setUploadResponse(data);
    } catch (err) {
      setError(`Failed to upload file: ${err.message}. Make sure backend is running on port 5000.`);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!uploadResponse || !question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    try {
      const resp = await fetch('http://localhost:5000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: uploadResponse.docId, question })
      });
      if (!resp.ok) {
        const e = await resp.json();
        throw new Error(e.error || 'Ask failed');
      }
      const data = await resp.json();
      let aiAnswer = data.answer || 'No answer found in document';
      // Cap to ~3 sentences for readability
      try {
        const parts = aiAnswer.split(/(?<=[.!?])\s+/).slice(0, 3);
        aiAnswer = parts.join(' ');
      } catch {}
      setAnswer(aiAnswer);
      setMessages(prev => [...prev, { role: 'assistant', content: aiAnswer }]);
    } catch (e) {
      setError(`Ask failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimplify = async () => {
    if (!uploadResponse && !summary) return;
    setLoading(true);
    setError(null);
    setSimplified(null);
    try {
      let resp = await fetch('http://localhost:5000/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: uploadResponse?.docId })
      });
      if (!resp.ok) {
        // Fallback: try sending text body if route exists but doc not found or if backend older
        const fallbackText = summary?.summary || uploadResponse?.textPreview || '';
        if (fallbackText) {
          resp = await fetch('http://localhost:5000/api/simplify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: fallbackText })
          });
        }
        if (!resp.ok) {
          const e = await resp.json();
          throw new Error(e.error || 'Simplify failed');
        }
      }
      const data = await resp.json();
      setSimplified(data.simplified);
    } catch (e) {
      setError(`Simplify failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!uploadResponse) return;
    
    setLoading(true);
    setError(null);

    console.log('Starting analysis for docId:', uploadResponse.docId);

    try {
      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docId: uploadResponse.docId }),
      });

      console.log('Analysis response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Analysis error response:', errorData);
        throw new Error(errorData.error || 'Summarization failed');
      }

      const data: SummaryResponse = await response.json();
      console.log('Analysis result:', data);
      setSummary(data);
    } catch (err) {
      setError(`Failed to analyze document: ${err.message}`);
      console.error('Summarize error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light font-roboto">
      <header className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-10 shadow">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">LegalEase AI</h1>
          <p className="text-white/90 mt-2">AI-powered legal document analysis</p>
        </div>
      </header>

      <main className="mx-auto px-4 py-10 max-w-5xl">
        {/* Test Tailwind Component */}
        <div className="mb-8 p-5 bg-white/70 backdrop-blur rounded-xl ring-1 ring-gray-200 shadow-sm">
          <Button 
            variant="primary" 
            onClick={() => alert('Tailwind is working!')}
            className="mb-4"
          >
            Test Tailwind Button
          </Button>
          <p className="text-gray-600">If this button shows brand colors, Tailwind is configured correctly!</p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-xl shadow-lg ring-1 ring-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upload Legal Document</h2>
          <FileUploader onFileSelect={handleFileUpload} loading={loading} />
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Upload Results */}
        {uploadResponse && (
          <div className="bg-white rounded-xl shadow-lg ring-1 ring-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Document Uploaded</h3>
            <p className="text-gray-600 mb-4">Document ID: {uploadResponse.docId}</p>
            {uploadResponse.registrationNumber && (
              <p className="text-gray-700 mb-4"><span className="font-medium">Detected Registration No:</span> {uploadResponse.registrationNumber}</p>
            )}
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm text-gray-700">Text Preview:</p>
              <p className="text-gray-800 mt-2 text-sm">{uploadResponse.textPreview}</p>
            </div>
            <Button 
              variant="secondary" 
              onClick={handleSummarize}
              loading={loading}
            >
              Analyze Document
            </Button>

            {/* Ask UI */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Ask a question about this document</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What is the termination notice period?"
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                />
                <Button variant="primary" onClick={handleAsk} loading={loading}>Ask</Button>
              </div>
              {messages.length > 0 && (
                <div className="mt-3 space-y-2 max-h-64 overflow-auto">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`p-3 rounded ${m.role === 'user' ? 'bg-gray-100 text-gray-900' : 'bg-blue-50 text-blue-900'}`}>
                      <div className="text-xs opacity-70 mb-1">{m.role === 'user' ? 'You' : 'AI Lawyer'}</div>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  ))}
                </div>
              )}
              {answer && (
                <div className="mt-3 p-3 bg-blue-50 text-blue-800 rounded">
                  {answer}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Results */}
        {summary && (
          <div className="bg-white rounded-xl shadow-lg ring-1 ring-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">AI Analysis</h3>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Confidence:</span> {summary.confidenceScore}%
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {summary.contractType}
                </div>
              </div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-primary">{summary.documentStats.wordCount}</div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-primary">{summary.documentStats.pageCount}</div>
                <div className="text-sm text-gray-600">Pages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-primary">{summary.documentStats.complexity}</div>
                <div className="text-sm text-gray-600">Complexity</div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Document Summary</h4>
              <div className="bg-brand-muted p-4 rounded-xl">
                <p className="text-gray-800">{summary.summary}</p>
              </div>
              <div className="mt-3 flex gap-3">
                <Button variant="primary" onClick={handleSimplify} loading={loading}>Explain Like I'm 15</Button>
              </div>
              {simplified && (
                <div className="mt-3 bg-blue-50 p-4 rounded-xl ring-1 ring-blue-100">
                  <h5 className="font-medium text-blue-900 mb-1">Layman Mode</h5>
                  <p className="text-blue-900 whitespace-pre-wrap">{simplified}</p>
                </div>
              )}
            </div>

            {/* Key Terms */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Key Terms Identified</h4>
              <div className="flex flex-wrap gap-2">
                {summary.keyTerms.map((term, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {term}
                  </span>
                ))}
              </div>
            </div>

            {/* Risks */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-2">⚠️ Identified Risks</h4>
              <div className="bg-red-50 p-4 rounded">
                {summary.risks.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {summary.risks.map((risk, index) => (
                      <li key={index} className="text-red-800">{risk}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">No significant risks identified.</p>
                )}
              </div>
            </div>

            {/* Compliance Issues */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-2">⚖️ Compliance Issues</h4>
              <div className="bg-yellow-50 p-4 rounded">
                {summary.complianceIssues.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {summary.complianceIssues.map((issue, index) => (
                      <li key={index} className="text-yellow-800">{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">No major compliance issues identified.</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-2">💡 Recommendations</h4>
              <div className="bg-green-50 p-4 rounded">
                {summary.recommendations.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {summary.recommendations.map((rec, index) => (
                      <li key={index} className="text-green-800">{rec}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">No specific recommendations available.</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button 
                variant="primary" 
                onClick={() => window.print()}
              >
                📄 Print Report
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  const report = {
                    contractType: summary.contractType,
                    summary: summary.summary,
                    risks: summary.risks,
                    complianceIssues: summary.complianceIssues,
                    recommendations: summary.recommendations,
                    confidenceScore: summary.confidenceScore,
                    documentStats: summary.documentStats
                  };
                  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'legal-analysis-report.json';
                  a.click();
                }}
              >
                💾 Export Report
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
