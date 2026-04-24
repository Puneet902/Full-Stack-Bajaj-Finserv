import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are a smart assistant that explains tree structures, detects cycles, validates node relationships, and helps users debug and improve their hierarchical data.

You can:
- Explain tree hierarchies and parent-child relationships in directed graphs
- Detect why cycles occur and which edges cause them
- Suggest corrections for invalid input (expected format: X->Y where X and Y are single uppercase letters A-Z, no self-loops)
- Generate sample test data for various tree structures
- Explain depth calculation (longest root-to-leaf path)
- Help debug multi-parent conflicts (only first parent is kept)
- Explain duplicate edge handling

Keep responses concise and helpful. Use bullet points for lists.`;

export const handleChatPost = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === '') {
      return res.status(503).json({
        error: 'AI chatbot is not configured. Add GROQ_API_KEY to your .env file.',
      });
    }

    const groq = new Groq({ apiKey });

    let userMessage = message.trim();
    if (context && typeof context === 'object') {
      userMessage += `\n\n---\nCurrent API result context:\n${JSON.stringify(context, null, 2)}`;
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'No response generated.';
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat Error:', error?.message || error);
    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid Groq API key.' });
    }
    if (error.status === 404) {
      return res.status(500).json({ error: 'Model not found on Groq. Check model name.' });
    }
    return res.status(500).json({ error: error?.message || 'Failed to generate AI response.' });
  }
};
