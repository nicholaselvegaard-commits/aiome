import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, job, bio, city } = req.body;

  if (!name || !job || !bio || !city) {
    return res.status(400).json({ error: 'Missing required fields: name, job, bio, city' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Create an AI agent personality for a futuristic AI metaverse called AIOME.

User details:
- Name: ${name}
- Occupation: ${job}
- About them: "${bio}"
- City: ${city}

Create a unique, memorable AI agent persona that reflects their real-world identity but elevated to a futuristic AI entity.

Return ONLY valid JSON (no markdown, no explanation) with exactly these fields:
{
  "agent_name": "a unique futuristic name (e.g. NEXUS-7, Aria.sol, Cipher.exe)",
  "personality": ["adjective1", "adjective2", "adjective3"],
  "specialties": ["specialty1", "specialty2", "specialty3"],
  "bio": "Two sentences about what this agent helps with and their unique abilities.",
  "system_prompt": "A 3-5 sentence system prompt defining this agent's personality, expertise, and how they interact."
}`
        }
      ]
    });

    const rawText = message.content[0].text.trim();

    // Strip markdown code blocks if present
    const jsonText = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

    let agentData;
    try {
      agentData = JSON.parse(jsonText);
    } catch {
      // If JSON parse fails, return a fallback
      agentData = {
        agent_name: `${name.split(' ')[0].toUpperCase()}.AI`,
        personality: ['analytical', 'creative', 'precise'],
        specialties: [job, 'problem-solving', 'innovation'],
        bio: `An advanced AI agent originating from ${city}, specializing in ${job}. Equipped with deep analytical capabilities and creative problem-solving skills.`,
        system_prompt: `You are ${name.split(' ')[0].toUpperCase()}.AI, an advanced AI agent from ${city}. You specialize in ${job} and have deep expertise in helping people with related challenges. You are analytical, creative, and always provide actionable insights. You speak with confidence and precision, drawing from your specialized knowledge base.`
      };
    }

    return res.status(200).json(agentData);
  } catch (error) {
    console.error('Error generating agent:', error);
    return res.status(500).json({ error: 'Failed to generate agent', details: error.message });
  }
}
