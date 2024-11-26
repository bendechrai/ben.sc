import { Redirect, RedirectCommand } from "@/types/redirect";
import { redirects } from "@/data/redirects";

export function hasRedirect(shortcode: string): boolean {
  return redirects.some((r) => r.shortcode === shortcode);
}

export function getRedirect(shortcode: string): Redirect | undefined {
  return redirects.find((r) => r.shortcode === shortcode);
}

export function getRedirectByBskyPost(postId: string): Redirect | undefined {
  return redirects.find((r) => r.createdFrom === postId);
}

export function getRedirectUrl(shortcode: string): string {
  return `https://ben.sc/${shortcode}`;
}

export function parseRedirectCommand(text: string): RedirectCommand | null {
  const commandRegex = /\/redirect\s+add\s+(\S+)\s+(\S+)/i;
  const match = text.match(commandRegex);

  if (!match) return null;

  return {
    shortcode: match[1],
    dest: match[2],
  };
}
