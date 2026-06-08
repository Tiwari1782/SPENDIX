const Groq = require('groq-sdk');
require('dotenv').config();

let groq = null;
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function getGroqClient() {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set. AI features are unavailable.');
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

/**
 * Parse raw invoice text and extract structured tool information.
 * @param {string} rawText - The raw invoice text
 * @returns {Object} { tool_name, amount, seats, renewal_date }
 */
async function parseInvoice(rawText) {
  const response = await getGroqClient().chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an invoice parsing assistant. Extract SaaS tool information from invoice text.
Return ONLY a valid JSON object with these fields:
- tool_name (string): the name of the SaaS tool
- amount (number): the monthly cost in INR (just the number, no currency symbol)
- seats (number or null): number of seats/users if mentioned
- renewal_date (string or null): next renewal/billing date in YYYY-MM-DD format if mentioned
Do not include any text outside the JSON object.`
      },
      {
        role: 'user',
        content: rawText
      }
    ],
    temperature: 0.1,
    max_tokens: 256
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from Groq');

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Failed to parse Groq response as JSON: ${content}`);
  }
}
