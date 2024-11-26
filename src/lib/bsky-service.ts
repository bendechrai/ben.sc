// import { BskyAgent } from "@atproto/api";
// import { Redirect } from "@/types/redirect";
// import { GitHubService } from "./github-service";
// import {
//   hasRedirect,
//   getRedirect,
//   getRedirectByBskyPost,
//   getRedirectUrl,
//   parseRedirectCommand,
// } from "./redirect-utils";

// export class BlueskyService {
//   private agent: BskyAgent;
//   private githubService: GitHubService;
//   private authorizedUsers: string[];

//   constructor() {
//     this.agent = new BskyAgent({
//       service: "https://bsky.social",
//     });
//     this.githubService = new GitHubService();
//     this.authorizedUsers = ["bendechr.ai"];
//   }

//   async init() {
//     await this.agent.login({
//       identifier: process.env.BSKY_BOT_IDENTIFIER!,
//       password: process.env.BSKY_BOT_PASSWORD!,
//     });
//   }

//   async handleMention(event: any) {
//     const postId = event.id;
//     const author = event.author;

//     // Only process commands from authorized users
//     if (!this.authorizedUsers.includes(author)) {
//       return;
//     }

//     // Skip if we've already processed this post
//     if (getRedirectByBskyPost(postId)) {
//       return;
//     }

//     const command = parseRedirectCommand(event.text);
//     if (!command) {
//       await this.replyToPost(
//         event,
//         'Sorry, I didn\'t understand that command. Use "/redirect add <shortcode> <url>" to create a new redirect.'
//       );
//       return;
//     }

//     // Check if shortcode already exists
//     if (hasRedirect(command.shortcode)) {
//       const existing = getRedirect(command.shortcode)!;
//       await this.replyToPost(
//         event,
//         `The shortcode '${command.shortcode}' already exists and points to: ${existing.dest}`
//       );
//       return;
//     }

//     try {
//       // Create new redirect
//       const newRedirect: Redirect = {
//         ...command,
//         createdAt: new Date().toISOString(),
//         createdFrom: postId,
//       };

//       // Create GitHub PR
//       const prUrl = await this.githubService.createRedirectPR(newRedirect);

//       // Reply with success
//       await this.replyToPost(
//         event,
//         `Created new redirect!\n\nShort URL: ${getRedirectUrl(
//           command.shortcode
//         )}\n\nA pull request has been created: ${prUrl}`
//       );
//     } catch (error) {
//       console.error("Error creating redirect:", error);
//       await this.replyToPost(
//         event,
//         "Sorry, there was an error creating the redirect. Please try again later."
//       );
//     }
//   }

//   private async replyToPost(event: any, text: string) {
//     await this.agent.post({
//       text,
//       reply: {
//         root: event.uri,
//         parent: event.uri,
//       },
//     });
//   }
// }
