export interface Redirect {
  shortcode: string;
  dest: string;
  createdAt: string;
  createdFrom?: string; // bsky post ID
}

export interface RedirectCommand {
  shortcode: string;
  dest: string;
}
