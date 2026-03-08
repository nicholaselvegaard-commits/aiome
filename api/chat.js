import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { systemPrompt, messages } = req.body;

  if (!systemPrompt || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing required fields: systemPrompt, messages (array)' });
  }

  // Validate message format
  const validMessages = messages.filter(
    (m) => m && typeof m.role === 'string' && typeof m.content === 'string'
  );

  if (validMessages.length === 0) {
    return res.status(400).json({ error: 'No valid messages provided' });
  }

  // Keep only last 20 messages to avoid token overflow
  const trimmedMessages = validMessages.slice(-20);

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: systemPrompt,
      messages: trimmedMessages
    });

    const reply = message.content[0].text;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Error in chat:', error);
    return res.status(500).json({ error: 'Failed to get response', details: error.message });
  }
}
