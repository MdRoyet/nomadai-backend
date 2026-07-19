import { Request, Response } from 'express';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { asyncHandler } from '../utils/asyncHandler';

const llm = new ChatGroq({
  model: 'llama-3.3-70b-versatile',
  temperature: 0.3,
  apiKey: process.env.GROQ_API_KEY,
});

export const translateText = asyncHandler(async (req: Request, res: Response) => {
  const { text, targetLanguage, sourceLanguage = 'English' } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ message: 'Text and target language are required' });
  }

  const systemPrompt = `You are an expert translator with deep cultural knowledge. Translate the following text from ${sourceLanguage} to ${targetLanguage}.

Rules:
1. Provide an accurate, natural translation
2. Maintain the original tone and intent
3. Adapt cultural references where appropriate
4. If the text contains idioms, translate the meaning rather than literally
5. Keep proper nouns unchanged unless there's a widely known local equivalent

Respond in JSON format:
{
  "translatedText": "the translation",
  "culturalNotes": "any cultural adaptation notes or tips (empty string if none)",
  "pronunciation": "phonetic guide for the translated text (if applicable)",
  "alternatives": ["alternative translation 1", "alternative translation 2"]
}`;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(text),
  ]);

  const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  // Try to parse JSON from response
  let result;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    result = jsonMatch ? JSON.parse(jsonMatch[0]) : { translatedText: content, culturalNotes: '', pronunciation: '', alternatives: [] };
  } catch {
    result = { translatedText: content, culturalNotes: '', pronunciation: '', alternatives: [] };
  }

  res.json(result);
});

export const getSupportedLanguages = asyncHandler(async (req: Request, res: Response) => {
  const languages = [
    { code: 'es', name: 'Spanish', native: 'Español', region: 'Europe & Americas' },
    { code: 'fr', name: 'French', native: 'Français', region: 'Europe & Africa' },
    { code: 'de', name: 'German', native: 'Deutsch', region: 'Europe' },
    { code: 'it', name: 'Italian', native: 'Italiano', region: 'Europe' },
    { code: 'pt', name: 'Portuguese', native: 'Português', region: 'Europe & Americas' },
    { code: 'zh', name: 'Chinese', native: '中文', region: 'Asia' },
    { code: 'ja', name: 'Japanese', native: '日本語', region: 'Asia' },
    { code: 'ko', name: 'Korean', native: '한국어', region: 'Asia' },
    { code: 'ar', name: 'Arabic', native: 'العربية', region: 'Middle East & Africa' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'Asia' },
    { code: 'th', name: 'Thai', native: 'ไทย', region: 'Asia' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', region: 'Asia' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe', region: 'Europe & Asia' },
    { code: 'nl', name: 'Dutch', native: 'Nederlands', region: 'Europe' },
    { code: 'ru', name: 'Russian', native: 'Русский', region: 'Europe & Asia' },
    { code: 'pl', name: 'Polish', native: 'Polski', region: 'Europe' },
    { code: 'sv', name: 'Swedish', native: 'Svenska', region: 'Europe' },
    { code: 'da', name: 'Danish', native: 'Dansk', region: 'Europe' },
    { code: 'fi', name: 'Finnish', native: 'Suomi', region: 'Europe' },
    { code: 'no', name: 'Norwegian', native: 'Norsk', region: 'Europe' },
    { code: 'el', name: 'Greek', native: 'Ελληνικά', region: 'Europe' },
    { code: 'he', name: 'Hebrew', native: 'עברית', region: 'Middle East' },
    { code: 'cs', name: 'Czech', native: 'Čeština', region: 'Europe' },
    { code: 'ro', name: 'Romanian', native: 'Română', region: 'Europe' },
    { code: 'hu', name: 'Hungarian', native: 'Magyar', region: 'Europe' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', region: 'Asia' },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', region: 'Asia' },
    { code: 'tl', name: 'Filipino', native: 'Filipino', region: 'Asia' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'Asia' },
    { code: 'ur', name: 'Urdu', native: 'اردو', region: 'Asia' },
    { code: 'fa', name: 'Persian', native: 'فارسی', region: 'Middle East' },
    { code: 'sw', name: 'Swahili', native: 'Kiswahili', region: 'Africa' },
    { code: 'uk', name: 'Ukrainian', native: 'Українська', region: 'Europe' },
    { code: 'bg', name: 'Bulgarian', native: 'Български', region: 'Europe' },
    { code: 'hr', name: 'Croatian', native: 'Hrvatski', region: 'Europe' },
    { code: 'sk', name: 'Slovak', native: 'Slovenčina', region: 'Europe' },
    { code: 'lt', name: 'Lithuanian', native: 'Lietuvių', region: 'Europe' },
    { code: 'lv', name: 'Latvian', native: 'Latviešu', region: 'Europe' },
    { code: 'et', name: 'Estonian', native: 'Eesti', region: 'Europe' },
    { code: 'sl', name: 'Slovenian', native: 'Slovenščina', region: 'Europe' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'Asia' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'Asia' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'Asia' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'Asia' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Asia' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'Asia' },
    { code: 'my', name: 'Myanmar', native: 'မြန်မာ', region: 'Asia' },
    { code: 'km', name: 'Khmer', native: 'ខ្មែរ', region: 'Asia' },
    { code: 'lo', name: 'Lao', native: 'ລາວ', region: 'Asia' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली', region: 'Asia' },
    { code: 'si', name: 'Sinhala', native: 'සිංහල', region: 'Asia' },
  ];

  res.json({ languages });
});
