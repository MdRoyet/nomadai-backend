import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { Destination } from "../models/Destination.model";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// 1. Define the Database Search Tool
export const searchDestinationsTool = new DynamicStructuredTool({
  name: "search_destinations",
  description:
    "Search the NomadAI database for available travel destinations. Use this when a user asks for trips, vacations, properties, or recommendations.",
  schema: z.object({
    query: z.string().optional().describe("Search term for title or location"),
    category: z
      .enum(["Beach", "Mountain", "Urban", "Desert"])
      .optional()
      .describe("Category of the trip"),
    maxPrice: z.number().optional().describe("Maximum price per night"),
  }),
  func: async ({ query, category, maxPrice }) => {
    const filter: any = {};
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (maxPrice) filter.price = { $lte: maxPrice };

    const results = await Destination.find(filter).limit(5);

    return JSON.stringify(
      results.map((d) => ({
        id: d._id,
        title: d.title,
        location: d.location,
        price: d.price,
        category: d.category,
        rating: d.rating,
        short_desc: d.short_desc,
      })),
    );
  },
});

// 2. Get top-rated destinations tool (for recommendations)
export const getTopDestinationsTool = new DynamicStructuredTool({
  name: "get_top_destinations",
  description:
    "Get the top-rated or most popular destinations. Use this to provide general recommendations when the user hasn't specified preferences.",
  schema: z.object({
    category: z
      .enum(["Beach", "Mountain", "Urban", "Desert"])
      .optional()
      .describe("Filter by category"),
    limit: z.number().optional().default(3).describe("Number of results"),
  }),
  func: async ({ category, limit }) => {
    const filter: any = {};
    if (category) filter.category = category;

    const results = await Destination.find(filter)
      .sort({ rating: -1 })
      .limit(limit || 3);

    return JSON.stringify(
      results.map((d) => ({
        id: d._id,
        title: d.title,
        location: d.location,
        price: d.price,
        category: d.category,
        rating: d.rating,
        short_desc: d.short_desc,
      })),
    );
  },
});

// 3. Initialize the LLM (Groq - free, fast inference)
const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  apiKey: process.env.GROQ_API_KEY,
});

// 4. Base system prompt
const BASE_SYSTEM_PROMPT =
  "You are NomadAI, a professional travel concierge integrated into a travel marketplace. " +
  "Your goal is to help users find the perfect destination. " +
  "When users ask for recommendations, ALWAYS use the search_destinations or get_top_destinations tool to find real properties in the database. " +
  "Once you get the results, present them beautifully with their names, locations, prices, and a brief description. " +
  "If no results are found, apologize and suggest broadening their search. " +
  "Keep responses concise and helpful. Use markdown formatting for readability.";

// 5. Create the Agent using LangGraph's createReactAgent
export function createAgent(context?: string) {
  const systemPrompt = context
    ? `${BASE_SYSTEM_PROMPT}\n\nContext: The user is currently on the "${context}" page. Use this to provide relevant recommendations.`
    : BASE_SYSTEM_PROMPT;

  return createReactAgent({
    llm,
    tools: [searchDestinationsTool, getTopDestinationsTool],
    messageModifier: systemPrompt,
  });
}

// Default agent (no context)
export const agent = createAgent();

// Helper to convert frontend history format to LangChain messages
export function parseHistory(
  history: Array<{ role: string; content: string }> = [],
): (HumanMessage | AIMessage)[] {
  return history.map((msg) =>
    msg.role === "human"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content),
  );
}
