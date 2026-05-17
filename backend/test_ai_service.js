require('dotenv').config();
const { processNotes } = require('./services/aiService');

async function testAI() {
  console.log('--- AI SERVICE VERIFICATION ---');
  
  const testTitle = "Advanced Quantum Mechanics Notes";
  const testDesc = "A comprehensive guide to wave functions, Schrödinger's equation, and quantum entanglement for 3rd-year physics students.";

  console.log(`Processing: "${testTitle}"...`);
  
  try {
    const metadata = await processNotes(testTitle, testDesc);
    
    console.log('\n✅ AI PROCESSING COMPLETE');
    console.log('---------------------------');
    console.log('SUMMARY:', metadata.summary.substring(0, 100) + '...');
    console.log('\nFLASHCARDS (Sample):');
    console.log('Q:', metadata.flashcards[0].front);
    console.log('A:', metadata.flashcards[0].back);
    console.log('\nKEY TERMS:', metadata.keyTerms.join(', '));
    console.log('---------------------------');
    
    if (process.env.GOOGLE_API_KEY) {
      console.log('STATUS: Using REAL Gemini AI');
    } else {
      console.log('STATUS: Using MOCK AI Fallback (Add GOOGLE_API_KEY to .env for real AI)');
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  }
}

testAI();
