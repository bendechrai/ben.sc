import { redirects } from "@/data/redirects";

export async function GET() {
  const defaultRedirect = redirects.find((r) => r.shortcode === "__default__");
  if (!defaultRedirect) {
    return new Response("No default redirect configured", { status: 500 });
  }

  return Response.redirect(defaultRedirect.dest);
}
