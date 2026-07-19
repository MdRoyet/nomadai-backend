import { Request, Response } from 'express';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { asyncHandler } from '../utils/asyncHandler';
import { Destination } from '../models/Destination.model';

const llm = new ChatGroq({
  model: 'llama-3.3-70b-versatile',
  temperature: 0.4,
  apiKey: process.env.GROQ_API_KEY,
});

export const matchDestinations = asyncHandler(async (req: Request, res: Response) => {
  const { preferences, budget, travelStyle, interests, climate, duration } = req.body;

  if (!preferences && !travelStyle && !interests) {
    return res.status(400).json({ message: 'Please provide at least some preferences' });
  }

  // Get all destinations from DB
  const allDestinations = await Destination.find().select('title short_desc price location category rating tags');

  const destList = allDestinations.map(d =>
    `- ${d.title} | ${d.location} | $${d.price}/night | ${d.category} | Rating: ${d.rating}/5 | Tags: ${d.tags?.join(', ')}`
  ).join('\n');

  const systemPrompt = `You are an expert AI travel advisor. Based on the user's preferences, recommend the best destinations from our catalog.

Available Destinations:
${destList}

User Preferences:
- Preferences: ${preferences || 'Not specified'}
- Budget: ${budget || 'Any'}
- Travel Style: ${travelStyle || 'Any'}
- Interests: ${interests || 'Not specified'}
- Preferred Climate: ${climate || 'Any'}
- Trip Duration: ${duration || 'Not specified'}

Respond in JSON format:
{
  "recommendations": [
    {
      "destinationId": "matching destination title exactly",
      "matchScore": 95,
      "reason": "Why this destination is a great match for the user",
      "highlights": ["highlight 1", "highlight 2", "highlight 3"],
      "bestFor": "what type of traveler this is best for",
      "estimatedBudget": "budget estimate",
      "bestTimeToVisit": "recommended season/month"
    }
  ],
  "travelTips": ["general tip 1", "general tip 2", "general tip 3"],
  "summary": "A brief personalized summary of the recommendations"
}

Return exactly 5 recommendations ranked by matchScore. Only recommend destinations that actually exist in the catalog above.`;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`Help me find my perfect travel destination. ${preferences || ''} ${interests ? 'I enjoy: ' + interests : ''}`),
  ]);

  const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  let result;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    result = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [], travelTips: [], summary: content };
  } catch {
    result = { recommendations: [], travelTips: [], summary: content };
  }

  // Enrich recommendations with actual destination data
  if (result.recommendations) {
    result.recommendations = result.recommendations.map((rec: any) => {
      const dest = allDestinations.find(d => d.title === rec.destinationId || d.title.toLowerCase().includes(rec.destinationId?.toLowerCase()));
      return {
        ...rec,
        destination: dest || null,
      };
    }).filter((rec: any) => rec.destination);
  }

  res.json(result);
});

export const getQuizQuestions = asyncHandler(async (req: Request, res: Response) => {
  const questions = [
    {
      id: 'style',
      question: 'What type of traveler are you?',
      options: [
        { label: 'Adventure Seeker', value: 'adventure', icon: '🏔️' },
        { label: 'Relaxation Lover', value: 'relaxation', icon: '🏖️' },
        { label: 'Culture Explorer', value: 'culture', icon: '🏛️' },
        { label: 'Food Enthusiast', value: 'food', icon: '🍜' },
        { label: 'Nature Explorer', value: 'nature', icon: '🌿' },
        { label: 'City Explorer', value: 'city', icon: '🌃' },
      ],
    },
    {
      id: 'climate',
      question: 'What climate do you prefer?',
      options: [
        { label: 'Tropical & Warm', value: 'tropical', icon: '☀️' },
        { label: 'Cool & Mountainous', value: 'cool', icon: '❄️' },
        { label: 'Mild & Pleasant', value: 'mild', icon: '🌤️' },
        { label: 'Any climate', value: 'any', icon: '🌍' },
      ],
    },
    {
      id: 'budget',
      question: 'What is your nightly budget?',
      options: [
        { label: 'Budget ($0-100)', value: 'budget', icon: '💰' },
        { label: 'Mid-Range ($100-300)', value: 'mid', icon: '💎' },
        { label: 'Luxury ($300+)', value: 'luxury', icon: '👑' },
        { label: 'Any budget', value: 'any', icon: '🎯' },
      ],
    },
    {
      id: 'interests',
      question: 'What activities interest you most?',
      options: [
        { label: 'Beach & Water Sports', value: 'beach, water sports, swimming', icon: '🌊' },
        { label: 'Hiking & Trekking', value: 'hiking, trekking, mountain climbing', icon: '🥾' },
        { label: 'History & Museums', value: 'history, museums, architecture', icon: '🎭' },
        { label: 'Nightlife & Shopping', value: 'nightlife, shopping, entertainment', icon: '🛍️' },
        { label: 'Wildlife & Safari', value: 'wildlife, safari, nature walks', icon: '🦁' },
        { label: 'Photography', value: 'photography, scenic views, landmarks', icon: '📸' },
      ],
    },
    {
      id: 'duration',
      question: 'How long is your trip?',
      options: [
        { label: 'Weekend (2-3 days)', value: 'weekend 2-3 days', icon: '⚡' },
        { label: 'Short (4-7 days)', value: 'short week', icon: '📅' },
        { label: 'Extended (1-2 weeks)', value: 'extended 1-2 weeks', icon: '🗓️' },
        { label: 'Long-term (2+ weeks)', value: 'long term 2+ weeks', icon: '🌍' },
      ],
    },
  ];

  res.json({ questions });
});
