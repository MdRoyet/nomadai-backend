import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
  apiKey: process.env.GROQ_API_KEY,
});

export interface AnalysisResult {
  summary: string;
  trends: string[];
  risks: string[];
  kpis: { label: string; value: string; trend?: string }[];
  recommendations: string[];
  rawData: { headers: string[]; rows: (string | number)[][]; rowCount: number };
}

export function parseCSV(content: string): { headers: string[]; rows: (string | number)[][] } {
  const records = parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, unknown>[];
  const headers = records.length > 0 ? Object.keys(records[0]) : [];
  const rows = records.map((r) => headers.map((h) => r[h] as string | number));
  return { headers, rows };
}

export function parseExcel(buffer: Buffer): { headers: string[]; rows: (string | number)[][] } {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
  if (data.length === 0) return { headers: [], rows: [] };
  const headers = (data[0] as string[]).map(String);
  const rows = data.slice(1).filter((r) => r && r.length > 0);
  return { headers, rows };
}

export function parseJSON(content: string): { headers: string[]; rows: (string | number)[][] } {
  const data = JSON.parse(content);
  const arr = Array.isArray(data) ? data : [data];
  if (arr.length === 0) return { headers: [], rows: [] };
  const headers = [...new Set(arr.flatMap((r) => Object.keys(r)))];
  const rows = arr.map((r) => headers.map((h) => r[h] ?? ""));
  return { headers, rows };
}

export async function analyzeData(
  headers: string[],
  rows: (string | number)[][],
  fileName: string,
  customQuestion?: string,
): Promise<AnalysisResult> {
  // Summarize data for LLM (limit to avoid token overflow)
  const sampleRows = rows.slice(0, 20);
  const dataPreview = JSON.stringify(sampleRows);
  const totalRows = rows.length;

  // Compute basic stats
  const stats = headers.map((h, i) => {
    const values = rows.map((r) => r[i]).filter((v) => v !== "" && v !== null && v !== undefined);
    const nums = values.map(Number).filter((n) => !isNaN(n));
    const col: Record<string, unknown> = { name: h, count: values.length, unique: new Set(values).size };
    if (nums.length > 0) {
      const sum = nums.reduce((a, b) => a + b, 0);
      col.avg = Math.round((sum / nums.length) * 100) / 100;
      col.min = Math.min(...nums);
      col.max = Math.max(...nums);
    }
    return col;
  });

  const question = customQuestion
    ? `\n\nUser specifically asks: "${customQuestion}"`
    : "";

  const prompt = `You are a professional data analyst for a travel marketplace called NomadAI.
Analyze this dataset and provide actionable insights.

**File:** ${fileName}
**Total rows:** ${totalRows}
**Columns:** ${headers.join(", ")}
**Column stats:** ${JSON.stringify(stats)}
**Sample data (first 20 rows):** ${dataPreview}
${question}

Respond in EXACTLY this JSON format (no markdown, no code blocks):
{
  "summary": "2-3 sentence overview of what this data shows",
  "trends": ["trend 1", "trend 2", "trend 3"],
  "risks": ["risk 1", "risk 2"],
  "kpis": [{"label": "KPI name", "value": "calculated value", "trend": "up/down/stable"}],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"]
}`;

  const response = await llm.invoke([{ role: "user", content: prompt }]);
  const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

  // Extract JSON from response
  let parsed;
  try {
    // Try to find JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No JSON found");
    }
  } catch {
    parsed = {
      summary: content,
      trends: [],
      risks: [],
      kpis: [],
      recommendations: [],
    };
  }

  return {
    summary: parsed.summary || "Analysis complete.",
    trends: parsed.trends || [],
    risks: parsed.risks || [],
    kpis: parsed.kpis || [],
    recommendations: parsed.recommendations || [],
    rawData: { headers, rows: rows.slice(0, 100), rowCount: totalRows },
  };
}
