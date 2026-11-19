import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildDossierId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `CDS-${year}${month}-${suffix}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'career-dossier-studio' });
  });

  app.post('/api/analyze-profile', async (req, res) => {
    try {
      const {
        learnerName,
        learnerTrack,
        riasecImage,
        bigFiveImage,
        careerChoices,
      } = req.body ?? {};

      if (!riasecImage?.data || !riasecImage?.mimeType) {
        res.status(400).json({ error: 'Please upload an image file of your RIASEC test results.' });
        return;
      }

      if (!bigFiveImage?.data || !bigFiveImage?.mimeType) {
        res.status(400).json({ error: 'Please upload an image file of your Big 5 personality test results.' });
        return;
      }

      const cleanedChoices: string[] = Array.isArray(careerChoices)
        ? careerChoices.map((c) => String(c ?? '').trim()).filter(Boolean)
        : [];

      if (cleanedChoices.length < 3) {
        res.status(400).json({ error: 'Please enter all top three career choices before generating your profile.' });
        return;
      }

      const ai = createGeminiClient();

      const promptText = `Analyze the two attached assessment result images for this learner and synthesize a concise, poster-ready Career Interest Profile Summary & Interpretation.

Learner Name: ${String(learnerName || 'Learner').trim()}
Academic Track / Cohort: ${String(learnerTrack || 'General Career Exploration').trim()}

Manually-Typed Top Three Career Choices:
1. ${cleanedChoices[0]}
2. ${cleanedChoices[1]}
3. ${cleanedChoices[2]}

Image 1 is the learner's RIASEC (Holland Code) test result image.
Image 2 is the learner's Big 5 (OCEAN) personality test result image.

Instructions:
1. Read Image 1 carefully. Extract all six RIASEC scores (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) normalized to a 0-100 scale. If the chart uses a different scale (e.g., 0-40 or 0-10 or percentiles), normalize to 0-100 proportionally and specify the original unit in "rawUnit". Determine the 3-letter Holland Code (e.g., "IAS") from the highest three dimensions. Provide concise 1-sentence insights for the top 3 dominant traits.
2. Read Image 2 carefully. Extract all five Big 5 scores (Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism or Emotional Stability) normalized to 0-100. Set "neuroticismLabel" to "Emotional Stability" if the image uses Emotional Stability / Calmness instead of Neuroticism, or "Neuroticism" otherwise, keeping the score faithful to that label. Provide concise 1-sentence interpretations for all 5 traits.
3. Evaluate each of the 3 manually-typed career choices in order (ranks 1, 2, 3). Assign a grounded fit rating ("Strong Fit", "Aligned", or "Exploratory Fit"), write a 2-sentence synergy analysis linking specific RIASEC interests and Big 5 traits to the role, and add 1 concise growth edge sentence.
4. Write the overall "profileSynthesis" designed to fit cleanly on an archival Dossier or Credential ID poster:
   - "archetypeTitle": A dignified, realistic 2-4 word career identity title (e.g., "Analytical Systems Designer", "Empathetic Research Strategist"). No sci-fi or roleplay jargon.
   - "shortSummary": 2-3 crisp sentences summarizing their core interest-personality intersection.
   - "interpretation": 3-4 clear, insightful sentences interpreting how what energizes them (RIASEC), how they operate daily (Big 5), and their top 3 career choices reinforce or stretch one another.
   - "workEnvironmentIdeal": 1 concise sentence describing their optimal team and work environment.
   - "recommendedNextStep": 1 concrete, practical exploration step (e.g., portfolio project, informational interview, shadowing, or coursework focus).
   - "keyStrengths": 3 short, crisp strength phrases (3-5 words each).`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: String(riasecImage.mimeType),
                data: String(riasecImage.data),
              },
            },
            {
              inlineData: {
                mimeType: String(bigFiveImage.mimeType),
                data: String(bigFiveImage.data),
              },
            },
            { text: promptText },
          ],
        },
        config: {
          systemInstruction:
            'You are an experienced career guidance counselor and psychometric analyst. You read visual assessment charts accurately without fabricating scores, and write clear, human-centered, concise career profile interpretations suitable for an editorial dossier and academic credential poster.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riasec: {
                type: Type.OBJECT,
                properties: {
                  extractedCode: { type: Type.STRING },
                  rawUnit: { type: Type.STRING },
                  scores: {
                    type: Type.OBJECT,
                    properties: {
                      realistic: { type: Type.NUMBER },
                      investigative: { type: Type.NUMBER },
                      artistic: { type: Type.NUMBER },
                      social: { type: Type.NUMBER },
                      enterprising: { type: Type.NUMBER },
                      conventional: { type: Type.NUMBER },
                    },
                    required: [
                      'realistic',
                      'investigative',
                      'artistic',
                      'social',
                      'enterprising',
                      'conventional',
                    ],
                  },
                  dominantTraits: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        code: { type: Type.STRING },
                        name: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                        insight: { type: Type.STRING },
                      },
                      required: ['code', 'name', 'score', 'insight'],
                    },
                  },
                  visualSummary: { type: Type.STRING },
                },
                required: ['extractedCode', 'rawUnit', 'scores', 'dominantTraits', 'visualSummary'],
              },
              bigFive: {
                type: Type.OBJECT,
                properties: {
                  rawUnit: { type: Type.STRING },
                  neuroticismLabel: { type: Type.STRING },
                  scores: {
                    type: Type.OBJECT,
                    properties: {
                      openness: { type: Type.NUMBER },
                      conscientiousness: { type: Type.NUMBER },
                      extraversion: { type: Type.NUMBER },
                      agreeableness: { type: Type.NUMBER },
                      neuroticism: { type: Type.NUMBER },
                    },
                    required: [
                      'openness',
                      'conscientiousness',
                      'extraversion',
                      'agreeableness',
                      'neuroticism',
                    ],
                  },
                  traitHighlights: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        trait: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                        level: { type: Type.STRING },
                        interpretation: { type: Type.STRING },
                      },
                      required: ['trait', 'score', 'level', 'interpretation'],
                    },
                  },
                  visualSummary: { type: Type.STRING },
                },
                required: ['rawUnit', 'neuroticismLabel', 'scores', 'traitHighlights', 'visualSummary'],
              },
              careerAlignment: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    choiceRank: { type: Type.INTEGER },
                    careerTitle: { type: Type.STRING },
                    fitRating: { type: Type.STRING },
                    synergyAnalysis: { type: Type.STRING },
                    growthEdge: { type: Type.STRING },
                  },
                  required: ['choiceRank', 'careerTitle', 'fitRating', 'synergyAnalysis', 'growthEdge'],
                },
              },
              profileSynthesis: {
                type: Type.OBJECT,
                properties: {
                  archetypeTitle: { type: Type.STRING },
                  shortSummary: { type: Type.STRING },
                  interpretation: { type: Type.STRING },
                  workEnvironmentIdeal: { type: Type.STRING },
                  recommendedNextStep: { type: Type.STRING },
                  keyStrengths: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'archetypeTitle',
                  'shortSummary',
                  'interpretation',
                  'workEnvironmentIdeal',
                  'recommendedNextStep',
                  'keyStrengths',
                ],
              },
            },
            required: ['riasec', 'bigFive', 'careerAlignment', 'profileSynthesis'],
          },
        },
      });

      const rawJson = (response.text ?? '').trim();
      if (!rawJson) {
        res.status(502).json({ error: 'The model returned an empty analysis response. Please try again.' });
        return;
      }

      const parsed = JSON.parse(rawJson);

      res.json({
        dossierId: buildDossierId(),
        generatedAt: new Date().toISOString(),
        ...parsed,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error while analyzing assessment images.';
      console.error('[analyze-profile] error:', err);

      if (message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')) {
        res.status(403).json({
          error: 'Gemini API key is missing or invalid. Please check Settings > Secrets in AI Studio.',
        });
        return;
      }
      if (message.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error: 'Gemini API rate limit reached. Please wait a moment and try again.',
        });
        return;
      }
      res.status(500).json({ error: message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Dossier Studio listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
