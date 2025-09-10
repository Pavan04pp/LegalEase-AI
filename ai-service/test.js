const aiClient = require('./aiClient.js');

const testDocument = `
SAMPLE LEGAL AGREEMENT

This agreement is entered into between Company A and Company B for the provision of consulting services.

TERMS:
1. Company B will provide consulting services for a period of 12 months
2. Payment terms are Net 30 days
3. Either party may terminate with 30 days notice
4. Company A retains all intellectual property rights
5. Company B agrees to maintain confidentiality

This is a sample document for testing purposes.
`;

async function runTest() {
  console.log('Testing AI service...');
  
  try {
    const result = await aiClient.summarizeDocument(testDocument);
    console.log('Summary result:', JSON.stringify(result, null, 2));
    
    const risks = await aiClient.extractRisks(testDocument);
    console.log('Extracted risks:', risks);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

if (require.main === module) {
  runTest();
}
