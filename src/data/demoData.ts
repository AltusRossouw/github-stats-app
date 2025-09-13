// Demo data for when API is rate limited - Updated to match Altus profile brief
export const DEMO_USER = {
  login: 'altus',
  id: 123456,
  avatar_url: 'https://github.com/identicons/altus.png',
  name: 'Altus',
  company: 'Demo Company',
  blog: 'https://altus.dev',
  location: 'South Africa',
  email: null,
  bio: 'This is demo data based on the GitHub Profile Analyzer brief specifications.',
  twitter_username: 'altusdev',
  public_repos: 25,
  public_gists: 5,
  followers: 150,
  following: 100,
  created_at: '2016-02-01T00:00:00Z',
  updated_at: '2025-09-13T00:00:00Z',
  type: 'User',
  site_admin: false,
};

export const DEMO_REPOSITORIES = [
  {
    id: 1,
    name: 'typescript-framework',
    full_name: 'altus/typescript-framework',
    description: 'Advanced TypeScript framework for modern web applications',
    private: false,
    html_url: 'https://github.com/altus/typescript-framework',
    created_at: '2016-03-01T00:00:00Z',
    updated_at: '2025-09-01T00:00:00Z',
    pushed_at: '2025-09-01T00:00:00Z',
    size: 2048,
    stargazers_count: 1, // Total stars earned: 1
    watchers_count: 1,
    language: 'TypeScript',
    has_issues: true,
    has_projects: true,
    has_wiki: true,
    has_pages: true,
    forks_count: 0,
    open_issues_count: 0,
    topics: ['typescript', 'framework', 'web'],
    visibility: 'public',
    default_branch: 'main',
  },
  {
    id: 2,
    name: 'cpp-algorithms',
    full_name: 'altus/cpp-algorithms',
    description: 'High-performance algorithms implemented in C++',
    private: false,
    html_url: 'https://github.com/altus/cpp-algorithms',
    created_at: '2018-06-01T00:00:00Z',
    updated_at: '2025-08-15T00:00:00Z',
    pushed_at: '2025-08-15T00:00:00Z',
    size: 1536,
    stargazers_count: 0,
    watchers_count: 0,
    language: 'C++',
    has_issues: true,
    has_projects: false,
    has_wiki: false,
    has_pages: false,
    forks_count: 0,
    open_issues_count: 0,
    topics: ['cpp', 'algorithms', 'performance'],
    visibility: 'public',
    default_branch: 'main',
  },
  {
    id: 3,
    name: 'python-data-tools',
    full_name: 'altus/python-data-tools',
    description: 'Python tools for data analysis and visualization',
    private: false,
    html_url: 'https://github.com/altus/python-data-tools',
    created_at: '2019-01-01T00:00:00Z',
    updated_at: '2025-07-20T00:00:00Z',
    pushed_at: '2025-07-20T00:00:00Z',
    size: 512,
    stargazers_count: 0,
    watchers_count: 0,
    language: 'Python',
    has_issues: true,
    has_projects: true,
    has_wiki: false,
    has_pages: false,
    forks_count: 0,
    open_issues_count: 0,
    topics: ['python', 'data-analysis', 'visualization'],
    visibility: 'public',
    default_branch: 'main',
  },
];

export const DEMO_LANGUAGE_STATS = {
  'TypeScript': 59920, // 59.92%
  'C++': 19450,        // 19.45%
  'Python': 9760,      // 9.76%
  'JavaScript': 4220,  // 4.22%
  'Swift': 3490,       // 3.49%
  'Jupyter Notebook': 3170, // 3.17%
};

export const DEMO_COMMIT_ACTIVITY = [
  { total: 12, week: 1694649600, days: [2, 1, 3, 0, 4, 2, 0] },
  { total: 18, week: 1695254400, days: [3, 2, 4, 1, 5, 3, 0] },
  { total: 8, week: 1695859200, days: [1, 0, 2, 1, 3, 1, 0] },
  { total: 25, week: 1696464000, days: [4, 3, 6, 2, 7, 3, 0] },
  { total: 15, week: 1697068800, days: [2, 1, 4, 2, 4, 2, 0] },
  { total: 22, week: 1697673600, days: [3, 2, 5, 3, 6, 3, 0] },
  { total: 10, week: 1698278400, days: [1, 1, 2, 1, 3, 2, 0] },
  { total: 19, week: 1698883200, days: [3, 2, 4, 2, 5, 3, 0] },
];

export const DEMO_RECENT_ACTIVITY = [
  {
    id: '1',
    type: 'PushEvent',
    actor: {
      id: 123456,
      login: 'demo-user',
      avatar_url: 'https://github.com/identicons/demo-user.png',
    },
    repo: {
      id: 1,
      name: 'demo-user/awesome-project',
      url: 'https://api.github.com/repos/demo-user/awesome-project',
    },
    payload: {
      size: 3,
      commits: [
        {
          sha: 'abc123',
          message: 'Add new feature',
          author: { name: 'Demo User', email: 'demo@example.com' },
        },
      ],
    },
    public: true,
    created_at: '2025-09-13T10:00:00Z',
  },
  {
    id: '2',
    type: 'CreateEvent',
    actor: {
      id: 123456,
      login: 'demo-user',
      avatar_url: 'https://github.com/identicons/demo-user.png',
    },
    repo: {
      id: 2,
      name: 'demo-user/new-project',
      url: 'https://api.github.com/repos/demo-user/new-project',
    },
    payload: {
      ref_type: 'repository',
      description: 'New exciting project',
    },
    public: true,
    created_at: '2025-09-12T15:30:00Z',
  },
];

export const DEMO_PROFILE_STATS = {
  user: DEMO_USER,
  repositories: DEMO_REPOSITORIES,
  totalStars: DEMO_REPOSITORIES.reduce((sum, repo) => sum + repo.stargazers_count, 0),
  totalForks: DEMO_REPOSITORIES.reduce((sum, repo) => sum + repo.forks_count, 0),
  languageStats: DEMO_LANGUAGE_STATS,
  contributionData: DEMO_COMMIT_ACTIVITY,
  recentActivity: DEMO_RECENT_ACTIVITY,
  topRepositories: DEMO_REPOSITORIES.slice(0, 3),
};