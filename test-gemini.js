// Test script for Gemini API
import 'dotenv/config'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

console.log('🧪 Testing Gemini API connection...')
console.log('API Key:', GEMINI_API_KEY ? `${GEMINI_API_KEY.slice(0, 10)}...` : 'NOT FOUND')

async function testGemini() {
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment')
    process.exit(1)
  }

  try {
    console.log('\n📡 Sending test request...')

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Hello! Can you confirm you are working? Just say "Gemini API is working!" and nothing else.',
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        },
      }),
    })

    console.log('Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      process.exit(1)
    }

    const data = await response.json()
    console.log('\n✅ Success! Full response:')
    console.log(JSON.stringify(data, null, 2))

    if (data.candidates && data.candidates[0]) {
      const text = data.candidates[0].content.parts[0].text
      console.log('\n🤖 Gemini says:', text)
    }

    console.log('\n✨ Gemini API is working correctly!')

    // Test domain analysis
    console.log('\n📊 Testing domain analysis...')
    const domainResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze this domain for investment:
Domain: ai.eth
AI Score: 85/100
Transactions: 12
Average Price: $2500
Price Change: +25%

Respond in JSON format with: recommendation, reasoning, riskFactors (array), opportunities (array)`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    })

    if (domainResponse.ok) {
      const domainData = await domainResponse.json()
      const analysisText = domainData.candidates[0].content.parts[0].text
      console.log('🎯 Domain Analysis:')
      console.log(analysisText)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.cause) {
      console.error('Cause:', error.cause)
    }
    process.exit(1)
  }
}

testGemini()
