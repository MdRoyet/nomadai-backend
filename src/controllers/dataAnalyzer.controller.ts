import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  parseCSV,
  parseExcel,
  parseJSON,
  parsePDF,
  analyzeData,
} from "../services/dataAnalyzer.service";

// @desc    Analyze uploaded data file
// @route   POST /api/data/analyze
export const analyzeFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const { originalname, mimetype, buffer } = req.file;
  const question = req.body.question as string | undefined;

  let parsed;
  try {
    if (mimetype === "text/csv" || originalname.endsWith(".csv")) {
      const content = buffer.toString("utf-8");
      parsed = parseCSV(content);
    } else if (
      mimetype === "application/json" ||
      originalname.endsWith(".json")
    ) {
      const content = buffer.toString("utf-8");
      parsed = parseJSON(content);
    } else if (
      mimetype === "application/pdf" ||
      originalname.endsWith(".pdf")
    ) {
      parsed = await parsePDF(buffer);
    } else if (
      mimetype.includes("excel") ||
      mimetype.includes("spreadsheet") ||
      originalname.endsWith(".xlsx") ||
      originalname.endsWith(".xls")
    ) {
      parsed = parseExcel(buffer);
    } else {
      throw new ApiError(400, "Unsupported file type. Please upload CSV, Excel, JSON, or PDF.");
    }
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(400, `Failed to parse file: ${err.message}`);
  }

  if (parsed.rows.length === 0) {
    throw new ApiError(400, "File is empty or has no extractable data");
  }

  try {
    const result = await analyzeData(
      parsed.headers,
      parsed.rows,
      originalname,
      question,
    );
    // Attach raw PDF text if available
    if ("text" in parsed) {
      result.rawData.pdfText = (parsed as { text: string }).text;
    }
    res.json(result);
  } catch (err: any) {
    console.error("Analysis error:", err);
    throw new ApiError(500, `AI analysis failed: ${err.message}`);
  }
});
