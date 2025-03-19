import { type NextRequest } from "next/server";
import { getRedirect } from "@/lib/redirect-utils";
import { logClickToTinybird } from "@/lib/tinybird-logger";

export async function GET(request: NextRequest) {
  const shortcode = "__default__";
  const redirectInfo = getRedirect(shortcode);

  if (!redirectInfo) {
    return new Response("Not Found", { status: 404 });
  }

  await logClickToTinybird(shortcode, redirectInfo.dest, request);
  return Response.redirect(redirectInfo.dest);
}
