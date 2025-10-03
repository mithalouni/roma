// Test with shorter prompt
const GEMINI_API_KEY = 'AIzaSyCPl_k64zVSRZKbDjAHxStCcnYwJ7uLdxk'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

async function test() {
  const prompt = `Analyze ai.eth for blockchain domain investment.

Data: Score=85/100, Txns=12, AvgPrice=$2500, Change=+25%, Offers=3, Fractionalized=N

Return ONLY valid JSON (no markdown):
{
  "recommendation": "brief buy/hold/avoid rec",
  "reasoning": "why in 1-2 sentences",
  "marketOutlook": "1 sentence outlook",
  "riskFactors": ["2 risks"],
  "opportunities": ["2 opportunities"],
  "suggestedActions": ["2 actions"]
}

Be concise.`

  console.log('📡 Testing with shorter prompt...\n')

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  })

  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text
  const finishReason = data.candidates[0].finishReason

  console.log('Finish reason:', finishReason)
  console.log('\nRaw response:')
  console.log(text)

  console.log('\n\nCleaned:')
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  console.log(cleaned)

  console.log('\n\nParsing...')
  try {
    const parsed = JSON.parse(cleaned)
    console.log('✅ SUCCESS!')
    console.log(JSON.stringify(parsed, null, 2))
  } catch (e) {
    console.log('❌ FAILED:', e.message)
  }
}

test()
