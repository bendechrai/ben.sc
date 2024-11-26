import { type NextRequest } from "next/server";
import { redirects } from "@/data/redirects";
import { logClickToTinybird } from "@/lib/tinybird-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortcode: string }> }
): Promise<Response> {
  const shortcode = (await params).shortcode;
  const redirectInfo = redirects.find((r) => r.shortcode === shortcode);

  if (!redirectInfo) {
    return new Response("Not Found", { status: 404 });
  }

  await logClickToTinybird(shortcode, redirectInfo.dest, request);
  return Response.redirect(redirectInfo.dest);
}
