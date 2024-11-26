import { type NextRequest } from "next/server";
import { redirects } from "@/data/redirects";
import { logClickToTinybird } from "@/lib/tinybird-logger";

export async function GET(request: NextRequest) {
  const defaultRedirect = redirects.find((r) => r.shortcode === "__default__");
  if (!defaultRedirect) {
    return new Response("No default redirect configured", { status: 500 });
  }

  await logClickToTinybird(
    defaultRedirect.shortcode,
    defaultRedirect.dest,
    request
  );
  return Response.redirect(defaultRedirect.dest);
}
