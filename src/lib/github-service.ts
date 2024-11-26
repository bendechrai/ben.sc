import { Octokit } from "@octokit/rest";
import { Redirect } from "@/types/redirect";
import { redirects } from "@/data/redirects";

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor() {
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    this.owner = process.env.GITHUB_REPO_OWNER!;
    this.repo = process.env.GITHUB_REPO_NAME!;
  }

  async createRedirectPR(newRedirect: Redirect): Promise<string> {
    const branchName = `redirect-${newRedirect.shortcode}`;
    const mainBranch = await this.getDefaultBranch();
    const currentFile = await this.getRedirectsFile(mainBranch);

    // Create new branch
    await this.createBranch(branchName, mainBranch);

    // Update redirects array
    const updatedRedirects = [...redirects, newRedirect];
    const newContent = `import { Redirect } from '@/types/redirect';\n\nexport const redirects: Redirect[] = ${JSON.stringify(
      updatedRedirects,
      null,
      2
    )};`;

    // Create commit
    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path: "src/data/redirects.ts",
      message: `Add redirect: ${newRedirect.shortcode}`,
      content: Buffer.from(newContent).toString("base64"),
      branch: branchName,
      sha: currentFile.sha,
    });

    // Create PR
    const pr = await this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title: `Add redirect: ${newRedirect.shortcode}`,
      head: branchName,
      base: mainBranch,
      body: `Adds new redirect:\n\n- Shortcode: ${newRedirect.shortcode}\n- Destination: ${newRedirect.dest}\n- Created from Bluesky post: ${newRedirect.createdFrom}`,
    });

    return pr.data.html_url;
  }

  private async getDefaultBranch(): Promise<string> {
    const { data: repo } = await this.octokit.repos.get({
      owner: this.owner,
      repo: this.repo,
    });
    return repo.default_branch;
  }

  private async getRedirectsFile(branch: string) {
    const { data } = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path: "src/data/redirects.ts",
      ref: branch,
    });

    if (Array.isArray(data)) {
      throw new Error("Expected single file");
    }

    return data;
  }

  private async createBranch(branchName: string, fromBranch: string) {
    const { data: ref } = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${fromBranch}`,
    });

    try {
      await this.octokit.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branchName}`,
        sha: ref.object.sha,
      });
    } catch (error) {
      // Branch might already exist
      console.error("Error creating branch:", error);
      throw error;
    }
  }
}
