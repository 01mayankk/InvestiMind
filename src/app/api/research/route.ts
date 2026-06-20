import { NextRequest, NextResponse } from "next/server";
import { investmentResearchGraph } from "../../../agents/investmentResearchGraph";
import { ResearchRequestSchema } from "../../../types/research";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request input structure
    const parsedInput = ResearchRequestSchema.safeParse(body);
    if (!parsedInput.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsedInput.error.format() },
        { status: 400 }
      );
    }

    const { query } = parsedInput.data;

    // Initialize graph state channels
    const initialState = {
      query,
      ticker: "",
      companyName: "",
      sector: "",
      financialData: null,
      newsData: [],
      providerStatuses: {},
      warningMessages: [],
      scoreResult: null,
      aiAnalysis: null,
      finalReport: null,
    };

    console.log(`[API /api/research] Launching LangGraph pipeline for query: "${query}"`);
    const outputState = await investmentResearchGraph.invoke(initialState);

    if (!outputState.finalReport) {
      return NextResponse.json(
        { error: "Analysis execution failed to generate a final report structure." },
        { status: 500 }
      );
    }

    return NextResponse.json(outputState.finalReport);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[API /api/research] Internal execution failure:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during research aggregation.", details: error.message },
      { status: 500 }
    );
  }
}
