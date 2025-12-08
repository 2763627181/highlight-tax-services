import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function main() {
  try {
    console.log('Getting GitHub client...');
    const octokit = await getUncachableGitHubClient();
    
    // Get authenticated user info
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`Logged in as: ${user.login}`);
    
    const repoName = 'highlight-tax-services';
    
    // Check if repo already exists
    try {
      const { data: existingRepo } = await octokit.repos.get({
        owner: user.login,
        repo: repoName
      });
      console.log(`Repository already exists: ${existingRepo.html_url}`);
      console.log('\n=== REPOSITORY INFO ===');
      console.log(`URL: ${existingRepo.html_url}`);
      console.log(`Clone URL: ${existingRepo.clone_url}`);
      return;
    } catch (e: any) {
      if (e.status !== 404) throw e;
      // Repo doesn't exist, create it
    }
    
    // Create repository
    console.log(`Creating repository: ${repoName}...`);
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'Highlight Tax Services - Professional Tax Preparation Web Application',
      private: false,
      auto_init: false
    });
    
    console.log('\n=== REPOSITORY CREATED ===');
    console.log(`URL: ${repo.html_url}`);
    console.log(`Clone URL: ${repo.clone_url}`);
    console.log(`\nNext step: Push your code to this repository`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
