import { type NextRequest } from "next/server";
import { redirects } from "@/data/redirects";

export async function GET(
  request: NextRequest,
  { params }: { params: { shortcode: string } }
) {
  // Await the params
  const { shortcode } = await params;
  const redirectInfo = redirects.find((r) => r.shortcode === shortcode);

  if (!redirectInfo) {
    return new Response("Not Found", { status: 404 });
  }

  return Response.redirect(redirectInfo.dest);
}
