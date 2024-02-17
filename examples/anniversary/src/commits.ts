export interface Commit {
  sha: string;
  commit: {
    committer: {
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  };
}

export interface ParsedCommit {
  date: Date;
  avatar?: string;
  message: string;
  raw: Commit;
}

const SINCE = '2fa61267c8fa3b12495df3c5d001718d5db9551a';
const PER_PAGE = 100;

async function fetchCommits(): Promise<ParsedCommit[]> {
  const url = new URL(
    'https://api.github.com/repos/motion-canvas/motion-canvas/commits',
  );
  url.searchParams.set('per_page', PER_PAGE.toString());
  let page = 1;

  const parsed: ParsedCommit[] = [];
  let commits: Commit[] = [];
  do {
    url.searchParams.set('page', page.toString());
    const response = await fetch(url.toString());
    commits = await response.json();

    for (const commit of commits) {
      parsed.push({
        date: new Date(commit.commit.committer.date),
        avatar: commit.author?.avatar_url,
        message: commit.commit.message,
        raw: commit,
      });
      if (commit.sha === SINCE) return parsed;
    }

    page++;
  } while (commits.length == PER_PAGE);

  return parsed;
}
