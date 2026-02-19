import { NextRequest, NextResponse } from "next/server";
import {
  readHistory,
  createSession,
  updateSessionLabel,
  deleteSession,
  clearHistory,
} from "@/lib/history";

export async function GET() {
  try {
    const data = readHistory();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read history";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action: string;
      sessionId?: string;
      label?: string;
    };

    const { action, sessionId, label } = body;

    switch (action) {
      case "createSession": {
        const session = createSession(label);
        return NextResponse.json(session);
      }

      case "updateLabel": {
        if (!sessionId || !label) {
          return NextResponse.json(
            { error: "sessionId and label are required for updateLabel." },
            { status: 400 },
          );
        }
        updateSessionLabel(sessionId, label);
        return NextResponse.json({ success: true });
      }

      case "deleteSession": {
        if (!sessionId) {
          return NextResponse.json(
            { error: "sessionId is required for deleteSession." },
            { status: 400 },
          );
        }
        deleteSession(sessionId);
        return NextResponse.json({ success: true });
      }

      case "clearAll": {
        clearHistory();
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "History operation failed";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
