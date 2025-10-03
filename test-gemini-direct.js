// Direct test of Gemini API with domain analysis
const GEMINI_API_KEY = 'AIzaSyCPl_k64zVSRZKbDjAHxStCcnYwJ7uLdxk'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

console.log('🧪 Testing Gemini API with domain analysis...\n')

async function testDomainAnalysis() {
  const prompt = `You are a domain name investment advisor analyzing blockchain domain assets on the Doma Protocol.

Domain: ai.eth
AI Value Score: 85/100
Transaction Count: 12
Average Sale Price: $2500.00
Price Change: +25.0%
Active Offers: 3
Fractionalized: No

Provide a concise investment analysis in the following JSON format (no markdown, just valid JSON):
{
  "recommendation": "A one-sentence recommendation",
  "reasoning": "2-3 sentences explaining the key factors",
  "marketOutlook": "1-2 sentences on market outlook",
  "riskFactors": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "suggestedActions": ["action1", "action2"]
}

Keep responses brief and actionable. Focus on data-driven insights.`

  try {
    console.log('📡 Sending request to Gemini...\n')

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', response.status, errorText)
      return
    }

    const data = await response.json()
    console.log('✅ Response received!\n')

    if (data.candidates && data.candidates[0]) {
      const text = data.candidates[0].content.parts[0].text
      console.log('📝 Raw response text:')
      console.log('---START---')
      console.log(text)
      console.log('---END---\n')

      // Try to clean and parse
      console.log('🧹 Cleaning response...')
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      console.log('Cleaned text:')
      console.log('---START---')
      console.log(cleaned)
      console.log('---END---\n')

      console.log('🔍 Attempting to parse JSON...')
      try {
        const parsed = JSON.parse(cleaned)
        console.log('✅ Successfully parsed JSON:')
        console.log(JSON.stringify(parsed, null, 2))
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message)
        console.log('\n🔎 Character-by-character inspection:')
        for (let i = 0; i < Math.min(cleaned.length, 300); i++) {
          const char = cleaned[i]
          const code = char.charCodeAt(0)
          if (char === '\n') {
            console.log(`[${i}] \\n (newline)`)
          } else if (char === '\r') {
            console.log(`[${i}] \\r (carriage return)`)
          } else if (char === '\t') {
            console.log(`[${i}] \\t (tab)`)
          } else if (code < 32 || code > 126) {
            console.log(`[${i}] [SPECIAL CHAR code=${code}]`)
          } else if (char === '"') {
            console.log(`[${i}] " (quote)`)
          }
        }
      }
    }

    console.log('\n📊 Full API Response:')
    console.log(JSON.stringify(data, null, 2))

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  }
}

testDomainAnalysis()
