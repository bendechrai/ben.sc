import { type NextRequest } from "next/server";
import { redirects } from "@/data/redirects";
import { logClickToTinybird } from "@/lib/tinybird-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: { shortcode: string } }
) {
  const { shortcode } = params;
  const redirectInfo = redirects.find((r) => r.shortcode === shortcode);

  if (!redirectInfo) {
    return new Response("Not Found", { status: 404 });
  }

  await logClickToTinybird(shortcode, redirectInfo.dest, request);
  return Response.redirect(redirectInfo.dest);
}
