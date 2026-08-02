import { fetchTedTalkData } from "@/lib/ted";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing required query parameter: url" },
      { status: 400 },
    );
  }

  const tedTalkData = await fetchTedTalkData(url);

  if (!tedTalkData) {
    return NextResponse.json(
      { error: "TED talk metadata or transcript could not be fetched." },
      { status: 422 },
    );
  }

  return NextResponse.json(tedTalkData);
}
