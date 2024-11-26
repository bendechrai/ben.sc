import { NextResponse } from "next/server";
import { BlueskyService } from "@/lib/bsky-service";

export const runtime = "edge";

let bskyService: BlueskyService | null = null;

export async function GET() {
  if (!bskyService) {
    bskyService = new BlueskyService();
    await bskyService.init();
  }

  // Subscribe to firehose
  const subscription = bskyService.agent.subscribe(
    "app.bsky.feed.post",
    async (event) => {
      if (event.text.includes("@ben.sc")) {
        await bskyService.handleMention(event);
      }
    }
  );

  // Keep connection alive
  return new NextResponse(null, {
    status: 200,
  });
}
