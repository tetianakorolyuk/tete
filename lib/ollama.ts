import { generateText } from 'ai';

// Ollama API endpoint - uses local Ollama instance
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Custom provider for Ollama
async function generateWithOllama(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Ollama generation failed:', error);
    return '';
  }
}

export async function generateProjectDescription(title: string, subtitle: string, facts: string[]): Promise<string> {
  const prompt = `Write a brief, elegant description (2-3 sentences) for an interior design project.
Project: ${title}
Type: ${subtitle}
Features: ${facts.join(', ')}

Style: Minimal, warm, sophisticated. Use natural materials and light-focused language.`;

  return await generateWithOllama(prompt);
}

export async function generateProjectFacts(title: string, description: string): Promise<{ label: string; value: string }[]> {
  const prompt = `For this interior design project, suggest 4 fact pairs (label and value):
Project: ${title}
Description: ${description}

Return ONLY a JSON array like: [{"label": "Palette", "value": "Warm oak, linen, stone"}]
Categories: Focus, Palette, Details, Mood, Location, Year, Materials, Lighting`;

  const response = await generateWithOllama(prompt);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}

  return [];
}

export async function generateSEOData(title: string, description: string): Promise<{ metaTitle: string; metaDescription: string }> {
  const prompt = `Generate SEO metadata for an interior design project.
Project: ${title}
Description: ${description}

Return JSON: {"metaTitle": "...", "metaDescription": "..."}
Meta title: Under 60 chars. Meta description: Under 160 chars, compelling.`;

  const response = await generateWithOllama(prompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}

  return { metaTitle: title, metaDescription: description };
}

export async function generateAltText(description: string): Promise<string> {
  const prompt = `Write a concise alt text (under 125 chars) for an interior design photo.
Description: ${description}

Be specific about what's visible. Example: "Modern living room with oak floors and linen sofa"`;

  return (await generateWithOllama(prompt)).slice(0, 125);
}
