import { Request, Response } from "express";
import { createAgent, parseHistory } from "../services/ai.service";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

// @desc    Chat with AI Concierge (non-streaming fallback)
// @route   POST /api/ai/chat
export const chatWithAgent = asyncHandler(
  async (req: Request, res: Response) => {
    const { message, history, context } = req.body;

    if (!message) {
      throw new ApiError(400, "Message is required");
    }

    try {
      const agent = createAgent(context);
      const result = await agent.invoke({
        messages: [
          ...parseHistory(history),
          { role: "user", content: message },
        ],
      });

      const lastMessage = result.messages[result.messages.length - 1];
      const reply =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);

      res.json({ reply });
    } catch (error: any) {
      console.error("Agent Error:", error);
      const msg = error?.message || "AI Agent failed to process request";
      if (msg.includes("429") || msg.includes("quota")) {
        throw new ApiError(429, "AI service quota exceeded. Please try again later.");
      }
      throw new ApiError(500, msg);
    }
  },
);

// @desc    Stream chat with AI Concierge (SSE)
// @route   POST /api/ai/chat/stream
export const chatStream = asyncHandler(
  async (req: Request, res: Response) => {
    const { message, history, context } = req.body;

    if (!message) {
      throw new ApiError(400, "Message is required");
    }

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    try {
      const agent = createAgent(context);
      const messages = [
        ...parseHistory(history),
        { role: "user" as const, content: message },
      ];

      const stream = await agent.stream({ messages });

      for await (const event of stream) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("Stream Error:", error);
      const msg = error?.message || "AI Agent failed to process request";
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  },
);

// @desc    Get AI recommendations based on context
// @route   POST /api/ai/recommendations
export const getRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    const { context, preferences } = req.body;

    try {
      const agent = createAgent(context);

      let query = "Give me personalized travel recommendations";
      if (preferences) {
        query += ` based on these preferences: ${preferences}`;
      }

      const result = await agent.invoke({
        messages: [{ role: "user", content: query }],
      });

      const lastMessage = result.messages[result.messages.length - 1];
      const reply =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);

      res.json({ reply });
    } catch (error: any) {
      console.error("Recommendation Error:", error);
      throw new ApiError(500, "Failed to generate recommendations");
    }
  },
);
