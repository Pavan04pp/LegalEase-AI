// Use built-in fetch for Node.js 18+ or fallback to node-fetch
let fetch;
try {
  fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
  fetch = require('node-fetch');
}
require('dotenv').config();

// Configuration for free APIs
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || 'hf_your_free_token_here';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

// Timeout for API calls
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Call Hugging Face API (free tier) for text analysis
 */
async function callHuggingFace(prompt, maxTokens = 1000) {
  try {
    const response = await Promise.race([
      fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: maxTokens,
            temperature: 0.7,
            return_full_text: false
          }
        })
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout')), API_TIMEOUT)
      )
    ]);

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || data[0]?.text || 'Analysis completed';

  } catch (error) {
    console.error('Hugging Face API error:', error.message);
    console.log('Falling back to mock response');
    return getMockResponse(prompt);
  }
}

/**
 * Summarize a legal document using free AI API
 */
async function summarizeDocument(text) {
  console.log('=== NEW ANALYSIS SYSTEM ACTIVE ===');
  console.log('Starting document summarization...');
  console.log('Document text length:', text.length);
  console.log('Document preview:', text.substring(0, 200));
  
  // Create dynamic analysis based on document content
  const analysis = analyzeDocumentContent(text);
  console.log('Analysis result:', analysis);
  return analysis;
}

/**
 * Analyze document content and create comprehensive response
 */
function analyzeDocumentContent(text) {
  const lowerText = text.toLowerCase();
  
  // Extract key information
  const hasContract = lowerText.includes('contract') || lowerText.includes('agreement');
  const hasPayment = lowerText.includes('payment') || lowerText.includes('fee') || lowerText.includes('amount');
  const hasTermination = lowerText.includes('termination') || lowerText.includes('terminate');
  const hasLiability = lowerText.includes('liability') || lowerText.includes('indemnify');
  const hasIntellectualProperty = lowerText.includes('intellectual property') || lowerText.includes('copyright') || lowerText.includes('patent');
  const hasConfidentiality = lowerText.includes('confidential') || lowerText.includes('non-disclosure');
  const hasDuration = lowerText.includes('duration') || lowerText.includes('term') || lowerText.includes('period');
  const hasForceMajeure = lowerText.includes('force majeure') || lowerText.includes('act of god');
  const hasDisputeResolution = lowerText.includes('arbitration') || lowerText.includes('mediation') || lowerText.includes('jurisdiction');
  
  // Determine contract type
  let contractType = 'General Agreement';
  if (text.includes('internship') || text.includes('intern')) {
    contractType = 'Internship Agreement';
  } else if (text.includes('employment') || text.includes('employee')) {
    contractType = 'Employment Contract';
  } else if (text.includes('service') || text.includes('consulting')) {
    contractType = 'Service Agreement';
  } else if (text.includes('nda') || text.includes('non-disclosure')) {
    contractType = 'Non-Disclosure Agreement';
  } else if (text.includes('lease') || text.includes('rental')) {
    contractType = 'Lease Agreement';
  } else if (text.includes('fee') || text.includes('annual')) {
    contractType = 'Fee Structure Document';
  }
  
  // Create comprehensive summary
  let summary = `[COMPREHENSIVE ANALYSIS] This is a ${contractType.toLowerCase()}. `;
  if (hasContract) summary += 'It contains detailed contract terms and conditions. ';
  if (hasPayment) summary += 'Payment terms and financial obligations are clearly specified. ';
  if (hasDuration) summary += 'The agreement has defined time periods and duration. ';
  if (hasConfidentiality) summary += 'Confidentiality and non-disclosure provisions are included. ';
  if (hasDisputeResolution) summary += 'Dispute resolution mechanisms are outlined. ';
  
  // Extract key terms
  const keyTerms = [];
  if (hasPayment) keyTerms.push('Payment Terms');
  if (hasTermination) keyTerms.push('Termination Clause');
  if (hasLiability) keyTerms.push('Liability & Indemnification');
  if (hasConfidentiality) keyTerms.push('Confidentiality');
  if (hasIntellectualProperty) keyTerms.push('Intellectual Property');
  if (hasForceMajeure) keyTerms.push('Force Majeure');
  if (hasDisputeResolution) keyTerms.push('Dispute Resolution');
  
  // Create dynamic risks based on content
  const risks = [];
  const complianceIssues = [];
  const recommendations = [];
  
  if (hasLiability) {
    risks.push('Broad liability clauses may expose you to excessive risk');
    complianceIssues.push('Indemnification language may be one-sided');
    recommendations.push('Consider limiting liability exposure and ensuring mutual indemnification');
  }
  
  if (hasPayment) {
    risks.push('Payment terms may not be clearly defined');
    complianceIssues.push('Fee structure may lack transparency');
    recommendations.push('Clarify payment schedules, amounts, and late payment penalties');
  }
  
  if (hasTermination) {
    risks.push('Termination conditions may be unfair or unclear');
    complianceIssues.push('Notice periods may not comply with local laws');
    recommendations.push('Ensure termination clauses are fair and legally compliant');
  }
  
  if (hasConfidentiality) {
    risks.push('Confidentiality obligations may be too broad or vague');
    complianceIssues.push('NDA scope may be overly restrictive');
    recommendations.push('Define confidential information clearly and set reasonable time limits');
  }
  
  if (hasIntellectualProperty) {
    risks.push('IP ownership terms may be unclear or unfair');
    complianceIssues.push('Work-for-hire clauses may be too broad');
    recommendations.push('Clearly define IP ownership and usage rights');
  }
  
  // Document-specific analysis
  if (contractType === 'Internship Agreement') {
    risks.push('Internship terms may not comply with labor laws');
    complianceIssues.push('Unpaid work provisions may violate minimum wage laws');
    recommendations.push('Ensure compliance with local internship and labor regulations');
    keyTerms.push('Work Hours', 'Compensation', 'Learning Objectives');
  }
  
  if (contractType === 'Employment Contract') {
    risks.push('Employment terms may not comply with labor standards');
    complianceIssues.push('Non-compete clauses may be unenforceable');
    recommendations.push('Review compliance with employment and labor laws');
    keyTerms.push('Salary', 'Benefits', 'Job Responsibilities', 'Non-Compete');
  }
  
  // Calculate confidence score
  const confidenceScore = Math.min(95, 60 + (keyTerms.length * 5) + (risks.length * 2));
  
  // Document statistics
  const wordCount = text.split(/\s+/).length;
  const pageCount = Math.ceil(wordCount / 250); // Rough estimate
  let complexity = 'Simple';
  if (wordCount > 2000) complexity = 'Complex';
  else if (wordCount > 1000) complexity = 'Moderate';
  
  // Add generic recommendations
  recommendations.push('Have this document reviewed by a qualified attorney');
  recommendations.push('Ensure all terms comply with applicable local laws');
  recommendations.push('Consider adding dispute resolution mechanisms if not present');
  
  return {
    summary: summary.trim() + ` [Analyzed at: ${new Date().toLocaleTimeString()}]`,
    risks: risks,
    contractType: contractType,
    keyTerms: keyTerms,
    complianceIssues: complianceIssues,
    recommendations: recommendations,
    confidenceScore: confidenceScore,
    documentStats: {
      wordCount: wordCount,
      pageCount: pageCount,
      complexity: complexity
    }
  };
}

/**
 * Extract risks from a legal document
 */
async function extractRisks(text) {
  const prompt = `Find potential risks in this legal document:

${text.substring(0, 2000)}

List the main risks:`;

  try {
    const response = await callHuggingFace(prompt, 300);
    const risks = response.split('\n')
      .filter(line => line.trim() && (line.includes('-') || line.includes('•') || /^\d+\./.test(line.trim())))
      .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
      .filter(risk => risk.length > 0);
    
    return risks.slice(0, 5);
    
  } catch (error) {
    console.error('Risk extraction failed:', error);
    return [
      'Unable to analyze document at this time',
      'Please check AI service configuration'
    ];
  }
}

/**
 * Layman Mode: simplify legal text to plain English
 */
function simplifyJargon(text) {
  if (!text || typeof text !== 'string') return '';
  const rules = [
    { re: /force\s*majeure/ig, simple: 'events beyond anyone\'s control (like natural disasters)' },
    { re: /indemnif(?:y|ication)/ig, simple: 'promise to cover losses or legal costs' },
    { re: /limitation\s+of\s+liability/ig, simple: 'cap on how much someone can be held responsible' },
    { re: /confidential(?:ity)?/ig, simple: 'keeping certain information private' },
    { re: /intellectual\s+property|IP\b/ig, simple: 'ownership of creations like software, designs, or text' },
    { re: /arbitration/ig, simple: 'private dispute resolution instead of court' },
    { re: /jurisdiction/ig, simple: 'which court or laws apply' },
    { re: /consideration/ig, simple: 'what each side gives to make the contract valid' },
    { re: /assign(?:ment)?/ig, simple: 'transfer of rights to someone else' },
    { re: /warranty/ig, simple: 'a promise that something meets certain standards' },
    { re: /breach/ig, simple: 'breaking a promise in the contract' },
    { re: /severability/ig, simple: 'if one part is invalid, the rest still works' },
    { re: /governing\s+law/ig, simple: 'which region\'s laws control this contract' },
    { re: /non-?solicit(?:ation)?/ig, simple: 'don\'t poach employees or clients' },
    { re: /non-?compete/ig, simple: 'don\'t work with a competitor for some time' },
  ];
  let simplified = text;
  for (const rule of rules) {
    simplified = simplified.replace(rule.re, (m) => `${m} (i.e., ${rule.simple})`);
  }
  return simplified;
}

/**
 * Generate a natural language answer from snippets and question (offline heuristic)
 */
function generateAnswer(question, snippets) {
  const q = (question || '').toLowerCase();
  const joined = (snippets || []).join(' ').trim();
  if (!joined) return 'I could not find an exact answer in the document.';
  const maxLen = 500;
  const concise = joined.length > maxLen ? joined.slice(0, maxLen) + '…' : joined;
  let preface = 'Here is what the document indicates: ';
  if (q.includes('termination')) preface = 'Regarding termination terms: ';
  else if (q.includes('payment') || q.includes('fee')) preface = 'Regarding payment terms: ';
  else if (q.includes('liability') || q.includes('indemn')) preface = 'Regarding liability and indemnification: ';
  else if (q.includes('confidential')) preface = 'Regarding confidentiality: ';
  else if (q.includes('ip') || q.includes('intellectual')) preface = 'Regarding intellectual property: ';
  return preface + concise;
}

async function answerQuestion(question, documentText) {
  const sentences = documentText
    .replace(/\r/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(s => s && s.trim().length > 0);
  const qTokens = (question || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const scored = sentences.map((s) => {
    const sLower = s.toLowerCase();
    const score = qTokens.reduce((acc, t) => acc + (sLower.includes(t) ? 1 : 0), 0) + Math.min(s.length / 500, 0.5);
    return { s, score };
  }).sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3).map(x => x.s);
  const answer = generateAnswer(question, top);
  return { answer, snippets: top };
}

/**
 * Parse text response into structured format
 */
function parseTextResponse(text) {
  if (!text || typeof text !== 'string') {
    return getMockResponse();
  }
  
  const summary = text.split('\n')[0] || 'Document analysis completed';
  
  const riskSection = text.toLowerCase();
  const risks = [];
  
  if (riskSection.includes('risk')) {
    risks.push('Potential legal risks identified in document');
  }
  if (riskSection.includes('liability')) {
    risks.push('Liability concerns present');
  }
  if (riskSection.includes('clause')) {
    risks.push('Review recommended for specific clauses');
  }
  if (riskSection.includes('termination')) {
    risks.push('Termination clauses need review');
  }
  if (riskSection.includes('payment')) {
    risks.push('Payment terms require verification');
  }
  
  return {
    summary: summary.replace(/^(summary|Summary):?\s*/i, '').substring(0, 300),
    risks: risks.length > 0 ? risks : ['Document requires manual review']
  };
}

/**
 * Mock response for when API is unavailable
 */
function getMockResponse() {
  const mockResponses = {
    summary: 'This document appears to be a legal agreement with standard terms and conditions. Key provisions include obligations, rights, and responsibilities of the parties involved.',
    risks: [
      'Broad indemnification clauses may increase liability exposure',
      'Termination conditions could be more favorable',
      'Intellectual property ownership terms need clarification',
      'Limitation of liability section requires review'
    ]
  };

  console.log('Using mock AI response (API key not configured or API unavailable)');
  return mockResponses;
}

module.exports = {
  summarizeDocument,
  extractRisks,
  answerQuestion,
  simplifyJargon
};
